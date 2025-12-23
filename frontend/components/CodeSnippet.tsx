import React from 'react'
import { cn } from "@/lib/utils"

interface CodeSnippetProps {
    code?: string
    startLine: number
    endLine: number
    className?: string
}

export function CodeSnippet({ code, startLine, endLine, className }: CodeSnippetProps) {
    if (!code) return null;

    return (
        <div className={cn("rounded-md bg-slate-950 p-4 overflow-x-auto text-sm text-slate-50 font-mono my-2", className)}>
            <div className="flex">
                <div className="flex-none w-8 text-right pr-4 text-slate-500 select-none border-r border-slate-800 mr-4">
                    {Array.from({ length: endLine - startLine + 1 }, (_, i) => (
                        <div key={i}>{startLine + i}</div>
                    ))}
                </div>
                <pre className="flex-1">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    )
}
