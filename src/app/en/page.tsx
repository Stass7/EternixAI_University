"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-300 to-dark-400 z-0"></div>
        <div className="absolute inset-0 opacity-30 z-0">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Educational Platform <span className="text-primary-500">EternixAI University</span>
              </h1>
              <p className="mt-6 text-xl text-white/80">
                Access to quality video courses on relevant topics. Learn at your own pace from anywhere in the world.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/en/courses" className="btn-primary text-center px-8 py-4 text-lg">
                  All Courses
                </Link>
                <Link href="/en/pricing" className="btn-secondary text-center px-8 py-4 text-lg">
                  Pricing
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="glassmorphism p-6 rounded-2xl"
            >
              <div className="aspect-video relative w-full rounded-lg overflow-hidden">
                <Image 
                  src="/images/hero-image.jpg" 
                  alt="EternixAI University Platform" 
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section bg-dark-300">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Why Choose Us
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-white/70"
            >
              EternixAI University offers a unique approach to education with a focus on quality and results
            </motion.p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality Video Lessons",
                description: "All materials are recorded by professionals with years of experience",
                icon: "��"
              },
              {
                title: "Learning Flexibility",
                description: "Study at a convenient time and at a pace that's comfortable for you",
                icon: "⏱️"
              },
              {
                title: "Certificates",
                description: "Receive certificates for completed courses for your portfolio",
                icon: "🎓"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Courses Section */}
      <section className="section bg-dark-400">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Popular Courses
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/en/courses" className="btn-secondary">
                All Courses
              </Link>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((course) => (
              <motion.div
                key={course}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * course }}
                className="glassmorphism rounded-xl overflow-hidden"
              >
                <div className="aspect-video relative">
                  <Image 
                    src={`/images/course-${course}.jpg`} 
                    alt={`Course ${course}`} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary-500/20 text-primary-300">Category</span>
                    <span className="text-white/60 text-sm">12 lessons</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-2">Course Title {course}</h3>
                  <p className="mt-2 text-white/70 line-clamp-2">Brief course description that gives an idea of its content and benefits for students.</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-primary-500 font-bold">$49.99</span>
                    <Link href={`/en/courses/${course}`} className="btn-primary text-sm">Learn More</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="section bg-dark-300">
        <div className="container-custom">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white text-center"
          >
            Student Testimonials
          </motion.h2>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alexander S.",
                role: "Developer",
                content: "The quality of the lessons exceeded all my expectations. The material is presented in a very accessible and interesting way."
              },
              {
                name: "Helen M.",
                role: "Designer",
                content: "Thanks to the courses, I was able to significantly improve my professional level and find a new job."
              },
              {
                name: "Dmitry K.",
                role: "Entrepreneur",
                content: "Great platform for those who value their time and want to receive only relevant knowledge."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-white/80">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-dark-400 to-dark-300">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Start Learning?</h2>
            <p className="mt-4 text-xl text-white/70">
              Join thousands of students who are already improving their skills with EternixAI University
            </p>
            <div className="mt-10">
              <Link href="/en/courses" className="btn-primary text-lg px-8 py-4">
                Start Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 