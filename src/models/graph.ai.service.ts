import { HumanMessage } from "@langchain/core/messages";
import { StateSchema, MessagesValue,ReducedValue, type GraphNode, StateGraph, START, END } from "@langchain/langgraph";
import {z} from "zod"
import {groqModel,cohereModel,geminiModel} from "./model.service.js"
import {createAgent,toolStrategy} from "langchain"
const State = new StateSchema({
  messages: MessagesValue,
  solution_1:new ReducedValue(z.string().default(""),{
    reducer:(current,next)=>{
        return next;
    }
  }),
  solution_2:new ReducedValue(z.string().default(""),{
    reducer:(current,next)=>{
        return next;
    }
  }),
  
judge_recommendation: new ReducedValue(
    z.object({
        solution_1_score: z.number().min(0).max(10),
        solution_2_score: z.number().min(0).max(10),
    }).default({
        solution_1_score: 0,
        solution_2_score: 0,
    }),
    {
        reducer: (current, next) => next
    }
)

 
  
});
const solutionNode:GraphNode<typeof State>=async (state:typeof State)=>{
   const [groq_solution,cohere_solution]=await Promise.all([
    groqModel.invoke(state.messages[0].text),
    cohereModel.chat({
    model: "command-a-plus-05-2026",
    messages: [
        {
            role: "user",
            content: state.messages[0].text,
        },
    ],
})
   ])
    return {
       solution_1:groq_solution.text,
       solution_2: cohere_solution.message?.content
    ?.map(item => item.type === "text" ? item.text : "")
    .join("") ?? ""
    }
}
const judgeNode:GraphNode<typeof State>=async (state:typeof State)=>{
    console.log("invoking judge state")
    const {solution_1,solution_2}=state;
    const judge=createAgent({
        model:geminiModel,
        tools:[],
        responseFormat:toolStrategy(z.object({
            solution_1_score:z.number().min(0).max(10),
            solution_2_score:z.number().min(0).max(10),

        }))
    })
   const judgeResponse=await judge.invoke({
    messages:[
        new HumanMessage(
  `You are a judge tasked with evaluating the quality of two solutions to a problem. The problem is: ${state.messages[0].text}. The first solution is: ${solution_1}. The second solution is: ${solution_2}. Please provide a score between 0 and 10 for each solution, where 0 means the solution is completely incorrect or irrelevant, and 10 means the solution is perfect and fully addresses the problem.`
        )

    ]
})
console.log("Full judge response:", judgeResponse);
console.log("Structured response:", judgeResponse.structuredResponse);

const result = judgeResponse.structuredResponse;

if (!result) {
    throw new Error("Judge did not return a structured response");
}

return {
    judge_recommendation: result
};
}
const graph=new StateGraph(State)
.addNode("solution",solutionNode)
.addNode("judge",judgeNode)
.addEdge(START,"solution")
.addEdge("solution","judge")
.addEdge("judge",END)
.compile()

export default async function(userMessage:string){
   const result= await graph.invoke({
        messages:[
            new HumanMessage(userMessage)
        ]
    })
    console.log(result)
  
return {
    solution_1: result.solution_1,
    solution_2: result.solution_2,
    judge_recommendation: result.judge_recommendation,
};

}