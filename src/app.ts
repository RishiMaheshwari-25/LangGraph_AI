import express from "express"
import useGraph from "./models/graph.ai.service.js"
const app=express();

app.get("/health",(req,res)=>{
    res.status(200).json({
        status:"ok"
    })
})
app.post("/use-graph",async(req,res)=>{
  await useGraph("how to write factorial of a number");
})
export default app;