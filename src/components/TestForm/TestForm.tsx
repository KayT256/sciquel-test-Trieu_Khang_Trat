"use client";

import { FormEvent, useState } from "react";
import axios from "axios";

export default function TestForm(){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [endScreen, setEndscreen] = useState(false);

    async function postComment(e: FormEvent){
        e.preventDefault();
        if(!name || !email || !comment){
            setError("All fields are required.")
        }
        try {
            const response = await axios.post("http://localhost:3000/api/comments", {
                name: name,
                email: email,
                comment: comment,
            });

            if(response.status == 200){
                setError("");
                setName("");
                setEmail("");
                setComment("");
                setEndscreen(true)
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong.  Please try again later.")
        }
    }

    return (
        endScreen ? <div>
            <h1>Comment Submitted.</h1>
            <button type="button" onClick={()=>{setEndscreen(false)}} 
            className="rounded border-2 border-teal-700 p-2">Submit another comment</button>
        </div>:
        <form 
        className="flex flex-col justify-center items-center"
        onSubmit={async (e)=>{
            postComment(e);
        }}>
            <label className="my-1">Name {"(required)"} <input className="border-2 border-teal-700" required type="text" value={name} onChange={(e)=> {setName(e.target.value)}}/></label>
            <label className="my-1">Email {"(required)"} <input className="border-2 border-teal-700" required type="text" value={email} onChange={(e)=> {setEmail(e.target.value)}}/></label>
            <label className="w-full my-1">Comment {"(required)"} <br/>
                <textarea 
                className="w-full border-2 border-teal-700"
                required  value={comment} onChange={(e)=> {setComment(e.target.value)}}/>
            </label>
            {error ? 
            <p className="p-2 bg-red-300 border-2 border-red-700">{error}</p>
            : <></>}
            <button type="submit">Submit Comment</button>
        </form>
    )
}