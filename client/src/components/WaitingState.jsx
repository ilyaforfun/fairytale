import React from 'react'
import { motion } from 'framer-motion'
import { Wand2, Sparkles, BookOpen } from 'lucide-react'

export default function WaitingState() {
  return (
    <div className="fixed inset-0 bg-purple-100 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Creating Your Fairytale</h2>
        <p className="text-purple-600 mb-6">Please wait while we weave your magical story...</p>
        
        <div className="relative w-48 h-48 mx-auto mb-6">
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Wand2 className="w-12 h-12 text-purple-500 absolute top-0 left-1/2 transform -translate-x-1/2" />
            <BookOpen className="w-12 h-12 text-purple-500 absolute bottom-0 left-1/2 transform -translate-x-1/2" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...Array(8)].map((_, index) => (
              <Sparkles
                key={index}
                className="w-6 h-6 text-yellow-400 absolute"
                style={{
                  top: `${50 - 40 * Math.cos((index * Math.PI) / 4)}%`,
                  left: `${50 + 40 * Math.sin((index * Math.PI) / 4)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </motion.div>
        </div>
        
        <motion.div
          className="h-2 bg-purple-200 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 20, ease: "linear" }}
        >
          <motion.div
            className="h-full bg-purple-600"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 20, ease: "linear" }}
          />
        </motion.div>
      </div>
    </div>
  )
}
