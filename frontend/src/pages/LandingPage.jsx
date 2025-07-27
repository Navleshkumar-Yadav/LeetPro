// import { motion } from 'framer-motion';
// import { 
//   Code, 
//   Trophy, 
//   Users, 
//   Zap, 
//   Target, 
//   Crown, 
//   Star, 
//   CheckCircle,
//   ArrowRight,
//   Play,
//   BookOpen,
//   Award,
//   TrendingUp,
//   Shield,
//   Sparkles,
//   ChevronDown,
//   Github,
//   Linkedin,
//   Twitter
// } from 'lucide-react';
// import { useNavigate } from 'react-router';
// import { useState, useEffect } from 'react';
// import AnimatedCard from '../components/AnimatedCard.jsx';
// import GradientButton from '../components/GradientButton.jsx';

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const [currentTestimonial, setCurrentTestimonial] = useState(0);

//   const features = [
//     {
//       icon: Code,
//       title: "1000+ Coding Problems",
//       description: "Practice with carefully curated problems from easy to expert level",
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: Trophy,
//       title: "Live Contests",
//       description: "Compete with developers worldwide in real-time coding contests",
//       color: "from-yellow-500 to-orange-500"
//     },
//     {
//       icon: Target,
//       title: "Skill Assessments",
//       description: "Test your knowledge with company-specific technical assessments",
//       color: "from-purple-500 to-pink-500"
//     },
//     {
//       icon: Crown,
//       title: "Premium Content",
//       description: "Access exclusive problems and detailed video solutions",
//       color: "from-yellow-400 to-yellow-600"
//     },
//     {
//       icon: Users,
//       title: "Community Driven",
//       description: "Learn from a vibrant community of passionate developers",
//       color: "from-green-500 to-emerald-500"
//     },
//     {
//       icon: Zap,
//       title: "Real-time Feedback",
//       description: "Get instant feedback on your code with detailed explanations",
//       color: "from-red-500 to-pink-500"
//     }
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       role: "Software Engineer at Google",
//       content: "LeetPro helped me land my dream job! The contest feature really improved my problem-solving speed.",
//       avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
//     },
//     {
//       name: "Alex Rodriguez",
//       role: "Full Stack Developer",
//       content: "The premium video explanations are incredibly detailed. Best investment for my coding career!",
//       avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
//     },
//     {
//       name: "Priya Sharma",
//       role: "CS Student",
//       content: "Started as a beginner, now I'm solving hard problems confidently. The learning path is amazing!",
//       avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
//     }
//   ];

//   const stats = [
//     { number: "50K+", label: "Active Users", icon: Users },
//     { number: "1M+", label: "Problems Solved", icon: CheckCircle },
//     { number: "500+", label: "Companies", icon: Award },
//     { number: "99%", label: "Success Rate", icon: TrendingUp }
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const scrollToFeatures = () => {
//     document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
//       {/* Background Effects */}
//       <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
//       <div className="fixed inset-0">
//         {[...Array(100)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-1 h-1 bg-white/10 rounded-full"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               opacity: [0.1, 0.6, 0.1],
//               scale: [1, 2, 1],
//             }}
//             transition={{
//               duration: Math.random() * 4 + 3,
//               repeat: Infinity,
//               delay: Math.random() * 3,
//             }}
//           />
//         ))}
//       </div>

//       {/* Navigation */}
//       <motion.nav 
//         className="relative z-50 glass-dark border-b border-gray-800"
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <motion.div
//               className="flex items-center space-x-3"
//               whileHover={{ scale: 1.05 }}
//             >
//               <Code className="w-8 h-8 text-blue-400" />
//               <span className="text-2xl font-bold gradient-text">LeetPro</span>
//             </motion.div>
            
//             <div className="flex items-center space-x-4">
//               <motion.button
//                 onClick={() => navigate('/login')}
//                 className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Sign In
//               </motion.button>
//               <GradientButton onClick={() => navigate('/signup')}>
//                 Get Started
//               </GradientButton>
//             </div>
//           </div>
//         </div>
//       </motion.nav>

//       {/* Hero Section */}
//       <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
//         <div className="container mx-auto text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1, delay: 0.2 }}
//           >
//             {/* Hero Badge */}
//             <motion.div
//               className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8"
//               animate={{ y: [0, -5, 0] }}
//               transition={{ duration: 3, repeat: Infinity }}
//             >
//               <Sparkles className="w-4 h-4 text-blue-400" />
//               <span className="text-blue-400 text-sm font-medium">Trusted by 50,000+ developers</span>
//             </motion.div>

//             {/* Main Heading */}
//             <motion.h1 
//               className="text-5xl md:text-7xl font-bold mb-6"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 1, delay: 0.4 }}
//             >
//               <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//                 Master Coding
//               </span>
//               <br />
//               <span className="text-white">Like a Pro</span>
//             </motion.h1>

//             {/* Subtitle */}
//             <motion.p 
//               className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1, delay: 0.6 }}
//             >
//               Elevate your programming skills with our comprehensive platform featuring 
//               <span className="text-blue-400 font-semibold"> interactive challenges</span>, 
//               <span className="text-purple-400 font-semibold"> live contests</span>, and 
//               <span className="text-yellow-400 font-semibold"> expert guidance</span>
//             </motion.p>

//             {/* CTA Buttons */}
//             <motion.div 
//               className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1, delay: 0.8 }}
//             >
//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <GradientButton 
//                   onClick={() => navigate('/signup')}
//                   className="px-8 py-4 text-lg font-semibold"
//                 >
//                   <Play className="w-5 h-5 mr-2" />
//                   Start Coding Now
//                 </GradientButton>
//               </motion.div>
//               <motion.button
//                 onClick={scrollToFeatures}
//                 className="px-8 py-4 text-lg font-semibold bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <BookOpen className="w-5 h-5 mr-2 inline" />
//                 Explore Features
//               </motion.button>
//             </motion.div>

//             {/* Scroll Indicator */}
//             <motion.div
//               className="flex justify-center"
//               animate={{ y: [0, 10, 0] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               <button
//                 onClick={scrollToFeatures}
//                 className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-600 transition-all"
//               >
//                 <ChevronDown className="w-6 h-6 text-gray-400" />
//               </button>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="relative z-10 py-20 bg-gray-800/30">
//         <div className="container mx-auto px-6">
//           <motion.div
//             className="grid grid-cols-2 md:grid-cols-4 gap-8"
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             {stats.map((stat, index) => {
//               const IconComponent = stat.icon;
//               return (
//                 <motion.div
//                   key={index}
//                   className="text-center"
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                 >
//                   <motion.div
//                     className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
//                     whileHover={{ scale: 1.1, rotate: 5 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <IconComponent className="w-8 h-8 text-blue-400" />
//                   </motion.div>
//                   <motion.div 
//                     className="text-3xl md:text-4xl font-bold text-white mb-2"
//                     animate={{ scale: [1, 1.05, 1] }}
//                     transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
//                   >
//                     {stat.number}
//                   </motion.div>
//                   <div className="text-gray-400 font-medium">{stat.label}</div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="relative z-10 py-20">
//         <div className="container mx-auto px-6">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl md:text-5xl font-bold mb-6">
//               <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//                 Everything You Need
//               </span>
//               <br />
//               <span className="text-white">To Excel in Coding</span>
//             </h2>
//             <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//               Our comprehensive platform provides all the tools and resources you need to become a coding expert
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => {
//               const IconComponent = feature.icon;
//               return (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 50 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                   className="group"
//                 >
//                   <AnimatedCard className="h-full text-center hover:border-blue-500/30 transition-all duration-300">
//                     <motion.div
//                       className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
//                       whileHover={{ scale: 1.1, rotate: 5 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       <IconComponent className="w-8 h-8 text-white" />
//                     </motion.div>
//                     <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
//                       {feature.title}
//                     </h3>
//                     <p className="text-gray-400 leading-relaxed">
//                       {feature.description}
//                     </p>
//                   </AnimatedCard>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section className="relative z-10 py-20 bg-gray-800/30">
//         <div className="container mx-auto px-6">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
//               How It <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Works</span>
//             </h2>
//             <p className="text-xl text-gray-300 max-w-2xl mx-auto">
//               Get started in minutes and begin your journey to coding mastery
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               {
//                 step: "01",
//                 title: "Sign Up & Choose Your Path",
//                 description: "Create your account and select your skill level to get personalized problem recommendations",
//                 icon: Target,
//                 color: "from-blue-500 to-cyan-500"
//               },
//               {
//                 step: "02", 
//                 title: "Practice & Learn",
//                 description: "Solve problems, watch video explanations, and track your progress with our advanced analytics",
//                 icon: BookOpen,
//                 color: "from-purple-500 to-pink-500"
//               },
//               {
//                 step: "03",
//                 title: "Compete & Excel",
//                 description: "Join live contests, earn points, and climb the leaderboard to showcase your skills",
//                 icon: Trophy,
//                 color: "from-yellow-500 to-orange-500"
//               }
//             ].map((step, index) => {
//               const IconComponent = step.icon;
//               return (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 50 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.2 }}
//                   viewport={{ once: true }}
//                   className="relative"
//                 >
//                   <AnimatedCard className="text-center h-full">
//                     <div className="relative">
//                       <motion.div
//                         className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
//                         whileHover={{ scale: 1.1 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <IconComponent className="w-10 h-10 text-white" />
//                       </motion.div>
//                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
//                         <span className="text-sm font-bold text-blue-400">{step.step}</span>
//                       </div>
//                     </div>
//                     <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
//                     <p className="text-gray-400 leading-relaxed">{step.description}</p>
//                   </AnimatedCard>
                  
//                   {/* Connecting Arrow */}
//                   {index < 2 && (
//                     <motion.div
//                       className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2"
//                       initial={{ opacity: 0, x: -20 }}
//                       whileInView={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
//                       viewport={{ once: true }}
//                     >
//                       <ArrowRight className="w-8 h-8 text-blue-400" />
//                     </motion.div>
//                   )}
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="relative z-10 py-20">
//         <div className="container mx-auto px-6">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
//               What Our <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Community</span> Says
//             </h2>
//             <p className="text-xl text-gray-300 max-w-2xl mx-auto">
//               Join thousands of developers who have transformed their careers with LeetPro
//             </p>
//           </motion.div>

//           <div className="max-w-4xl mx-auto">
//             <AnimatedCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
//               <motion.div
//                 key={currentTestimonial}
//                 initial={{ opacity: 0, x: 50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -50 }}
//                 transition={{ duration: 0.5 }}
//                 className="text-center"
//               >
//                 <motion.img
//                   src={testimonials[currentTestimonial].avatar}
//                   alt={testimonials[currentTestimonial].name}
//                   className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-blue-500/30"
//                   whileHover={{ scale: 1.1 }}
//                   transition={{ duration: 0.3 }}
//                 />
//                 <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 italic leading-relaxed">
//                   "{testimonials[currentTestimonial].content}"
//                 </blockquote>
//                 <div>
//                   <div className="font-bold text-white text-lg">
//                     {testimonials[currentTestimonial].name}
//                   </div>
//                   <div className="text-blue-400">
//                     {testimonials[currentTestimonial].role}
//                   </div>
//                 </div>
//               </motion.div>
              
//               {/* Testimonial Indicators */}
//               <div className="flex justify-center space-x-2 mt-8">
//                 {testimonials.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentTestimonial(index)}
//                     className={`w-3 h-3 rounded-full transition-all ${
//                       index === currentTestimonial 
//                         ? 'bg-blue-500 scale-125' 
//                         : 'bg-gray-600 hover:bg-gray-500'
//                     }`}
//                   />
//                 ))}
//               </div>
//             </AnimatedCard>
//           </div>
//         </div>
//       </section>

//       {/* Premium Features Section */}
//       <section className="relative z-10 py-20 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
//         <div className="container mx-auto px-6">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <div className="flex items-center justify-center mb-4">
//               <Crown className="w-12 h-12 text-yellow-400" />
//             </div>
//             <h2 className="text-4xl md:text-5xl font-bold mb-6">
//               <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
//                 Premium Features
//               </span>
//             </h2>
//             <p className="text-xl text-gray-300 max-w-2xl mx-auto">
//               Unlock advanced features and accelerate your learning journey
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//             {[
//               {
//                 title: "Exclusive Problem Sets",
//                 description: "Access premium problems from top tech companies",
//                 icon: Shield,
//                 benefits: ["Company-specific questions", "Detailed solutions", "Video explanations"]
//               },
//               {
//                 title: "Advanced Analytics",
//                 description: "Deep insights into your coding performance",
//                 icon: TrendingUp,
//                 benefits: ["Performance tracking", "Weakness analysis", "Progress reports"]
//               },
//               {
//                 title: "Priority Support",
//                 description: "Get help when you need it most",
//                 icon: Star,
//                 benefits: ["24/7 support", "Expert guidance", "Community access"]
//               },
//               {
//                 title: "Contest Advantages",
//                 description: "Enhanced contest experience and rewards",
//                 icon: Trophy,
//                 benefits: ["Early access", "Bonus points", "Exclusive contests"]
//               }
//             ].map((feature, index) => {
//               const IconComponent = feature.icon;
//               return (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 30 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                 >
//                   <AnimatedCard className="h-full bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
//                     <div className="flex items-start space-x-4">
//                       <motion.div
//                         className="p-3 bg-yellow-500/20 rounded-lg"
//                         whileHover={{ scale: 1.1, rotate: 5 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <IconComponent className="w-6 h-6 text-yellow-400" />
//                       </motion.div>
//                       <div className="flex-1">
//                         <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
//                         <p className="text-gray-400 mb-4">{feature.description}</p>
//                         <ul className="space-y-2">
//                           {feature.benefits.map((benefit, benefitIndex) => (
//                             <li key={benefitIndex} className="flex items-center space-x-2 text-sm text-gray-300">
//                               <CheckCircle className="w-4 h-4 text-green-400" />
//                               <span>{benefit}</span>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </div>
//                   </AnimatedCard>
//                 </motion.div>
//               );
//             })}
//           </div>

//           <motion.div
//             className="text-center mt-12"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//             viewport={{ once: true }}
//           >
//             <GradientButton 
//               onClick={() => navigate('/signup')}
//               className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black"
//             >
//               <Crown className="w-5 h-5 mr-2" />
//               Start Premium Trial
//             </GradientButton>
//             <p className="text-gray-400 text-sm mt-3">7-day free trial • Cancel anytime</p>
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="relative z-10 py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
//         <div className="container mx-auto px-6 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
//               Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Level Up</span>?
//             </h2>
//             <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
//               Join the community of successful developers who chose LeetPro to advance their careers
//             </p>
            
//             <motion.div 
//               className="flex flex-col sm:flex-row gap-4 justify-center"
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               viewport={{ once: true }}
//             >
//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <GradientButton 
//                   onClick={() => navigate('/signup')}
//                   className="px-8 py-4 text-lg font-semibold"
//                 >
//                   <Zap className="w-5 h-5 mr-2" />
//                   Start Free Today
//                 </GradientButton>
//               </motion.div>
//               <motion.button
//                 onClick={() => navigate('/login')}
//                 className="px-8 py-4 text-lg font-semibold bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Already have an account?
//               </motion.button>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="relative z-10 bg-gray-800/50 border-t border-gray-700">
//         <div className="container mx-auto px-6 py-12">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             {/* Brand */}
//             <div className="md:col-span-2">
//               <div className="flex items-center space-x-3 mb-4">
//                 <Code className="w-8 h-8 text-blue-400" />
//                 <span className="text-2xl font-bold gradient-text">LeetPro</span>
//               </div>
//               <p className="text-gray-400 mb-6 max-w-md">
//                 Empowering developers worldwide with comprehensive coding challenges, 
//                 contests, and learning resources to excel in their careers.
//               </p>
//               <div className="flex space-x-4">
//                 <motion.a
//                   href="#"
//                   className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                 >
//                   <Github className="w-5 h-5 text-gray-400" />
//                 </motion.a>
//                 <motion.a
//                   href="#"
//                   className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                 >
//                   <Twitter className="w-5 h-5 text-gray-400" />
//                 </motion.a>
//                 <motion.a
//                   href="#"
//                   className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                 >
//                   <Linkedin className="w-5 h-5 text-gray-400" />
//                 </motion.a>
//               </div>
//             </div>

//             {/* Quick Links */}
//             <div>
//               <h3 className="font-bold text-white mb-4">Platform</h3>
//               <ul className="space-y-2">
//                 {['Problems', 'Contests', 'Assessments', 'Premium'].map((link) => (
//                   <li key={link}>
//                     <button className="text-gray-400 hover:text-white transition-colors">
//                       {link}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Support */}
//             <div>
//               <h3 className="font-bold text-white mb-4">Support</h3>
//               <ul className="space-y-2">
//                 {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((link) => (
//                   <li key={link}>
//                     <button className="text-gray-400 hover:text-white transition-colors">
//                       {link}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           <div className="border-t border-gray-700 mt-8 pt-8 text-center">
//             <p className="text-gray-400">
//               © 2025 LeetPro. All rights reserved. Made with ❤️ for developers worldwide.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Target, 
  Users, 
  Award, 
  CheckCircle, 
  ArrowRight,
  Play,
  Sparkles,
  Shield,
  TrendingUp,
  Calendar,
  Gift,
  Building2,
  FileText,
  Video,
  Heart,
  Clock,
  Flame,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import GradientButton from '../components/GradientButton.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Code,
      title: "Interactive Code Editor",
      description: "Monaco-powered editor with syntax highlighting, auto-completion, and multi-language support",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Coding Contests",
      description: "Participate in live contests, compete with others, and climb the leaderboard",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Target,
      title: "Smart Assessments",
      description: "MCQ and coding assessments from top companies to test your skills",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Video,
      title: "Video Solutions",
      description: "Watch detailed video explanations for optimal and brute-force approaches",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Flame,
      title: "Streak Tracking",
      description: "Build coding habits with daily streaks and activity calendars",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Gift,
      title: "Points & Rewards",
      description: "Earn points by solving problems and redeem them in our exclusive store",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const premiumFeatures = [
    "Access to premium problems from top companies",
    "Company-specific problem collections",
    "Advanced video tutorials and explanations",
    "Priority customer support",
    "Exclusive coding challenges",
    "Detailed performance analytics",
    "Ad-free experience",
    "Early access to new features"
  ];

  const stats = [
    { number: "500+", label: "Coding Problems", icon: Code },
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "100+", label: "Companies", icon: Building2 },
    { number: "24/7", label: "Support", icon: Shield }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Software Engineer at Google",
      content: "LeetPro helped me crack my dream job! The contest feature really improved my problem-solving speed.",
      avatar: "AC"
    },
    {
      name: "Sarah Johnson",
      role: "Full Stack Developer",
      content: "The video explanations are incredibly detailed. I finally understand dynamic programming!",
      avatar: "SJ"
    },
    {
      name: "Raj Patel",
      role: "CS Student",
      content: "The streak feature keeps me motivated to code daily. Already solved 200+ problems!",
      avatar: "RP"
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/signup');
    }
  };

  const Icon = features[activeFeature].icon;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-50 glass-dark border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <Code className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold gradient-text">LeetPro</span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#premium" className="text-gray-300 hover:text-white transition-colors">Premium</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <GradientButton onClick={() => navigate('/')}>
                    <Code className="w-4 h-4 mr-2" />
                    Go to Problems
                  </GradientButton>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Sign In
                    </button>
                    <GradientButton onClick={() => navigate('/signup')}>
                      Get Started
                    </GradientButton>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="md:hidden mt-4 pb-4 border-t border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex flex-col space-y-4 pt-4">
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                  <a href="#premium" className="text-gray-300 hover:text-white transition-colors">Premium</a>
                  <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
                  {isAuthenticated ? (
                    <GradientButton onClick={() => navigate('/')} className="w-full">
                      Go to Problems
                    </GradientButton>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => navigate('/login')}
                        className="text-gray-300 hover:text-white transition-colors text-left"
                      >
                        Sign In
                      </button>
                      <GradientButton onClick={() => navigate('/signup')} className="w-full">
                        Get Started
                      </GradientButton>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Code className="w-20 h-20 text-blue-400" />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Master Coding
              </span>
              <br />
              <span className="text-white">Like a Pro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of developers improving their coding skills with our 
              <span className="text-blue-400 font-semibold"> interactive platform</span>, 
              <span className="text-purple-400 font-semibold"> live contests</span>, and 
              <span className="text-pink-400 font-semibold"> premium content</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GradientButton 
                  onClick={handleGetStarted}
                  className="px-8 py-4 text-lg font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isAuthenticated ? 'Start Coding' : 'Get Started Free'}
                </GradientButton>
              </motion.div>
              
              <motion.button
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                <span>Explore Features</span>
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[Trophy, Star, Code, Target, Crown].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                delay: index * 0.5,
              }}
            >
              <Icon className="w-8 h-8 text-blue-400/30" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 bg-gray-800/30">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-500/20 rounded-full">
                    <stat.icon className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to become a better programmer, all in one platform
            </p>
          </motion.div>

          {/* Interactive Feature Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-blue-500/10 border-blue-500/30 shadow-lg'
                        : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setActiveFeature(index)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <AnimatedCard className="p-8 h-96 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center`}>
                      {/* <features[activeFeature].icon className="w-12 h-12 text-white" /> */}
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{features[activeFeature].title}</h3>
                    <p className="text-gray-300">{features[activeFeature].description}</p>
                  </motion.div>
                </AnimatePresence>
              </AnimatedCard>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Heart,
                title: "Favorite Lists",
                description: "Organize problems into custom lists and track your progress",
                color: "text-red-400"
              },
              {
                icon: Calendar,
                title: "Activity Tracking",
                description: "Visual heatmaps and calendars to track your coding journey",
                color: "text-green-400"
              },
              {
                icon: Award,
                title: "Badges & Achievements",
                description: "Earn badges for milestones and showcase your accomplishments",
                color: "text-yellow-400"
              },
              {
                icon: FileText,
                title: "Personal Notes",
                description: "Take notes on problems and share insights with the community",
                color: "text-blue-400"
              },
              {
                icon: Clock,
                title: "Built-in Timer",
                description: "Track your solving time with stopwatch and timer features",
                color: "text-purple-400"
              },
              {
                icon: TrendingUp,
                title: "Progress Analytics",
                description: "Detailed insights into your performance and improvement areas",
                color: "text-cyan-400"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <AnimatedCard className="p-6 h-full text-center group">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gray-800/50 rounded-full group-hover:scale-110 transition-transform">
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Premium Section */}
      <section id="premium" className="relative z-10 py-20 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-16 h-16 text-yellow-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                LeetPro Premium
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock exclusive features and accelerate your coding journey with premium content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <AnimatedCard className="p-8 border-yellow-500/30 bg-yellow-500/5">
                <h3 className="text-2xl font-bold text-white mb-6">Premium Benefits</h3>
                <div className="space-y-4">
                  {premiumFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <GradientButton 
                    onClick={() => navigate('/premium')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold py-3"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </GradientButton>
                </div>
              </AnimatedCard>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Building2,
                  title: "Company Collections",
                  description: "Access problems asked by Google, Meta, Amazon, and 100+ companies"
                },
                {
                  icon: Video,
                  title: "Premium Video Content",
                  description: "Detailed video explanations for complex algorithms and data structures"
                },
                {
                  icon: TrendingUp,
                  title: "Advanced Analytics",
                  description: "Deep insights into your performance with detailed progress tracking"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <feature.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Loved by Developers
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of developers who have improved their coding skills with LeetPro
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <AnimatedCard className="p-6 h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                  <div className="flex items-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Level Up Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Coding Skills?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the LeetPro community today and start your journey to becoming a better programmer
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GradientButton 
                  onClick={handleGetStarted}
                  className="px-8 py-4 text-lg font-semibold"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isAuthenticated ? 'Start Coding Now' : 'Join Free Today'}
                </GradientButton>
              </motion.div>
              
              <motion.button
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/premium')}
              >
                <Crown className="w-5 h-5 text-yellow-400" />
                <span>Explore Premium</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-800/50 border-t border-gray-700 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <Code className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold gradient-text">LeetPro</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The ultimate platform for coding interview preparation and skill development. 
                Join thousands of developers improving their programming abilities.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">50K+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">4.9/5 Rating</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Problems</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contests</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Assessments</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Store</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 LeetPro. All rights reserved. Made with ❤️ for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

