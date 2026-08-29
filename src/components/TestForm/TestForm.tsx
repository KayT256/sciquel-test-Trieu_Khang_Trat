"use client";

import { FormEvent, useState } from "react";
import axios from "axios";

/* ------- my code: shape of the 400 body POST /api/comments returns ------- */

type CommentErrorResponse = {
    error?: string;
    fields?: Record<string, string[]>;
};

/* ------- end my code ------- */

export default function TestForm(){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [endScreen, setEndscreen] = useState(false);

    async function postComment(e: FormEvent){
        e.preventDefault();
        // I fix a small bug here
        // change from setError("All fields are required.") to setError(...) followed by return
        // it flagged the error and then posted the empty comment anyway
        if(!name || !email || !comment){
            setError("All fields are required.")
            return;
        }
        try {
            const response = await axios.post("http://localhost:3000/api/comments", {
                name: name,
                email: email,
                comment: comment,
            });

            // change from response.status == 200 to response.status == 201
            if(response.status == 201){
                setError("");
                setName("");
                setEmail("");
                setComment("");
                setEndscreen(true)
            }
        } catch (err) {
            console.error(err);

            /* ------- my code: show the per-field messages the API sends with a 400 ------- */

            // User's fault, not our fault, so tell them to fix
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                const { fields } = err.response.data as CommentErrorResponse;
                const messages = Object.values(fields ?? {}).flat();

                setError(
                    messages.length > 0
                        ? messages.join("  ")
                        : "Please check your comment and try again.",
                );
                return;
            }

            /* ------- end my code ------- */

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