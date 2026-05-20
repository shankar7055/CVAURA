"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

export const ToggleTheme = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"button"> & { className?: string }) => {
    const duration = 400
    const [isDark, setIsDark] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }

        updateTheme()

        const observer = new MutationObserver(updateTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        // Check if View Transitions API is supported
        if (!document.startViewTransition) {
            // Fallback: just toggle without animation
            const newTheme = !isDark
            setIsDark(newTheme)
            document.documentElement.classList.toggle("dark")
            localStorage.setItem("theme", newTheme ? "dark" : "light")
            return
        }

        // Wait for the DOM update to complete within the View Transition
        await document.startViewTransition(() => {
            flushSync(() => {
                const newTheme = !isDark
                setIsDark(newTheme)
                document.documentElement.classList.toggle("dark")
                localStorage.setItem("theme", newTheme ? "dark" : "light")
            })
        }).ready

        // Diagonal down-right animation
        document.documentElement.animate(
            {
                clipPath: [
                    `polygon(0 0, 0 0, 0 0, 0 0)`,
                    `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                ],
            },
            {
                duration: duration * 1.5,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    }, [isDark, duration])

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleTheme}
                className={cn(
                    "p-2 rounded-full transition-colors duration-300",
                    isDark ? "hover:text-amber-400" : "hover:text-blue-500",
                    className
                )}
                {...props}
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        ::view-transition-old(root),
                        ::view-transition-new(root) {
                            animation: none;
                            mix-blend-mode: normal;
                        }
                    `,
                }}
            />
        </>
    )
}