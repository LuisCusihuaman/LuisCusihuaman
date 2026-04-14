"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Play, Music, Code, Palette, Mic, User, Mail, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PortfolioPanelProps {
  activePanel: string | null
  onClose: () => void
}

const portfolioContent: Record<string, {
  title: string
  subtitle: string
  icon: React.ReactNode
  items: Array<{
    title: string
    description: string
    image?: string
    tags?: string[]
    link?: string
  }>
}> = {
  tv: {
    title: "Featured Projects",
    subtitle: "Demo Reel & Highlights",
    icon: <Play className="w-5 h-5" />,
    items: [
      {
        title: "Interactive 3D Portfolio",
        description: "This very experience you&apos;re exploring right now. Built with React Three Fiber, featuring Portal-style navigation.",
        tags: ["Three.js", "React", "WebGL"],
      },
      {
        title: "Music Visualization App",
        description: "Real-time audio visualization using Web Audio API and custom shaders.",
        tags: ["GLSL", "Web Audio", "Canvas"],
      },
      {
        title: "Digital Art Gallery",
        description: "Curated collection showcasing digital illustrations and concept art.",
        tags: ["Gallery", "Art", "Curation"],
      },
    ],
  },
  tablet: {
    title: "Illustration & Design",
    subtitle: "Visual Art Portfolio",
    icon: <Palette className="w-5 h-5" />,
    items: [
      {
        title: "Character Concept Art",
        description: "Original character designs for games and animation projects.",
        tags: ["Concept Art", "Characters"],
      },
      {
        title: "Digital Paintings",
        description: "Landscape and environmental art pieces.",
        tags: ["Painting", "Environment"],
      },
      {
        title: "UI/UX Design Work",
        description: "Interface designs for web and mobile applications.",
        tags: ["UI", "UX", "Product"],
      },
    ],
  },
  piano: {
    title: "Music & Composition",
    subtitle: "Audio Productions",
    icon: <Music className="w-5 h-5" />,
    items: [
      {
        title: "Original Compositions",
        description: "Piano pieces and orchestral arrangements.",
        tags: ["Piano", "Orchestra"],
      },
      {
        title: "Game Soundtracks",
        description: "Music composed for indie game projects.",
        tags: ["Game Audio", "Soundtrack"],
      },
      {
        title: "Sound Design",
        description: "Sound effects and ambient audio design.",
        tags: ["SFX", "Ambient"],
      },
    ],
  },
  laptop: {
    title: "Web Development",
    subtitle: "Code & Engineering",
    icon: <Code className="w-5 h-5" />,
    items: [
      {
        title: "Full-Stack Applications",
        description: "Production web apps built with Next.js, TypeScript, and modern tooling.",
        tags: ["Next.js", "TypeScript", "React"],
      },
      {
        title: "Open Source Contributions",
        description: "Contributions to various open source projects.",
        tags: ["OSS", "GitHub"],
      },
      {
        title: "Creative Coding",
        description: "Generative art and interactive experiments.",
        tags: ["Generative", "P5.js", "Canvas"],
      },
    ],
  },
  microphone: {
    title: "Audio & Media",
    subtitle: "Voice & Recording",
    icon: <Mic className="w-5 h-5" />,
    items: [
      {
        title: "Podcast Production",
        description: "Recording, editing, and producing audio content.",
        tags: ["Podcast", "Audio"],
      },
      {
        title: "Voice Recording",
        description: "Narration and voice work for various projects.",
        tags: ["Voice", "Narration"],
      },
      {
        title: "Audio Engineering",
        description: "Mixing, mastering, and audio post-production.",
        tags: ["Mixing", "Mastering"],
      },
    ],
  },
  plant: {
    title: "About Me",
    subtitle: "The Creative Behind the Work",
    icon: <User className="w-5 h-5" />,
    items: [
      {
        title: "Multidisciplinary Creator",
        description: "I blend coding, art, and music to create unique digital experiences. My work spans from interactive web applications to original compositions and digital illustrations.",
        tags: ["Art", "Code", "Music"],
      },
      {
        title: "Tools & Technologies",
        description: "TypeScript, React, Three.js, Blender, Procreate, Logic Pro, Ableton Live, and more.",
        tags: ["Stack", "Tools"],
      },
      {
        title: "Philosophy",
        description: "I believe in crafting experiences that feel personal, memorable, and human. Every project is an opportunity to tell a story.",
        tags: ["Values", "Approach"],
      },
    ],
  },
  mug: {
    title: "Get in Touch",
    subtitle: "Let&apos;s Connect",
    icon: <Mail className="w-5 h-5" />,
    items: [
      {
        title: "Email",
        description: "hello@example.com",
        link: "mailto:hello@example.com",
      },
      {
        title: "GitHub",
        description: "github.com/yourusername",
        link: "https://github.com",
      },
      {
        title: "Twitter",
        description: "@yourusername",
        link: "https://twitter.com",
      },
    ],
  },
  phone: {
    title: "Social Links",
    subtitle: "Find Me Online",
    icon: <ExternalLink className="w-5 h-5" />,
    items: [
      {
        title: "LinkedIn",
        description: "Professional network and work history",
        link: "https://linkedin.com",
      },
      {
        title: "Dribbble",
        description: "Design shots and visual work",
        link: "https://dribbble.com",
      },
      {
        title: "SoundCloud",
        description: "Music and audio releases",
        link: "https://soundcloud.com",
      },
    ],
  },
}

export function PortfolioPanel({ activePanel, onClose }: PortfolioPanelProps) {
  const content = activePanel ? portfolioContent[activePanel] : null
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {content && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    {content.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{content.title}</h2>
                    <p className="text-sm text-neutral-400">{content.subtitle}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <div className="space-y-4">
                  {content.items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                      onClick={() => item.link && window.open(item.link, "_blank")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-white group-hover:text-neutral-100 flex items-center gap-2">
                            {item.title}
                            {item.link && (
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
                            {item.description}
                          </p>
                          {item.tags && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs bg-neutral-700/50 text-neutral-300 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/50">
                <p className="text-xs text-neutral-500 text-center">
                  Press ESC or click outside to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function HoverIndicator({ hoveredObject }: { hoveredObject: string | null }) {
  const labels: Record<string, string> = {
    tv: "Featured Projects",
    tablet: "Illustration & Art",
    piano: "Music & Composition",
    laptop: "Web Development",
    microphone: "Audio & Media",
    plant: "About Me",
    mug: "Contact",
    phone: "Social Links",
  }

  return (
    <AnimatePresence>
      {hoveredObject && labels[hoveredObject] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="px-4 py-2 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-full shadow-lg">
            <p className="text-sm text-white font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-pulse" />
              {labels[hoveredObject]}
              <span className="text-neutral-500 text-xs ml-1">Click to view</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ControlsHint({ isLocked }: { isLocked: boolean }) {
  return (
    <AnimatePresence>
      {!isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <div className="w-16 h-16 mx-auto border-2 border-white/30 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </motion.div>
            <p className="text-white text-lg font-medium mb-2">Click to Enter</p>
            <p className="text-white/60 text-sm">Move with WASD | Look with Mouse</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Crosshair({ isLocked }: { isLocked: boolean }) {
  if (!isLocked) return null
  
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-sm" />
    </div>
  )
}
