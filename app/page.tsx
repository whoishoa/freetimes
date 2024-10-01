'use client'

import * as React from "react"
import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner" // Import your spinner component

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export default function GlassmorphicMeetingCreator() {
  const [meetingDescription, setMeetingDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  const handleCreate = () => {
    setIsLoading(true)
    console.log("Creating meeting for:", meetingDescription)
    setMeetingDescription('')


    // Simulate a 10-second loading delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-cyan-500">
      <Card className="w-full max-w-md backdrop-filter backdrop-blur-lg bg-white bg-opacity-20 border border-opacity-20 border-white rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Create Your Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="What meeting link would you like to create?" 
            className="w-full p-4 text-lg bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-md shadow-sm placeholder:white text-white focus:border-white transition-all duration-300"
            rows={4}
            value={meetingDescription}
            onChange={(e) => setMeetingDescription(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          {isLoading ? (
            <Spinner />
          ) : (
            <Button 
              className="w-full bg-white bg-opacity-30 hover:bg-opacity-40 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              onClick={handleCreate}
            >
              Create Meeting
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
