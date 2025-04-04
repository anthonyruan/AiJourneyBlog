import { Link } from "wouter";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";

export default function About() {
  return (
    <>
      {/* About Header */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
              About Me
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600">
              Get to know the person behind the AI experiments
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:shrink-0">
                  <img 
                    className="h-64 w-full object-cover md:h-full md:w-48" 
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80" 
                    alt="Profile photo" 
                  />
                </div>
                <div className="p-8">
                  <div className="uppercase tracking-wide text-sm text-primary-600 font-semibold">AI Researcher & Developer</div>
                  <h3 className="mt-1 text-2xl font-medium text-gray-900 font-heading">Admin User</h3>
                  <p className="mt-4 text-gray-600">
                    I'm an AI enthusiast and developer focused on natural language processing and computer vision applications. My journey began with traditional machine learning and has evolved to working with transformer-based models and generative AI.
                  </p>
                  <p className="mt-3 text-gray-600">
                    Currently, I'm exploring the intersection of multimodal learning and practical applications of AI in everyday tools. This blog documents my learning process, challenges, and discoveries along the way.
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900">Connect with me</h4>
                    <div className="mt-3 flex space-x-6">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                        <FaGithub className="text-2xl" />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500">
                        <FaTwitter className="text-2xl" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
                        <FaLinkedin className="text-2xl" />
                      </a>
                      <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
                        <SiHuggingface className="text-2xl" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Skills */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-8">
            <h2 className="text-2xl font-bold font-heading text-gray-900 mb-6">My AI Journey</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Skills & Expertise</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Python</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">PyTorch</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">TensorFlow</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">NLP</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Computer Vision</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Hugging Face</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Transformers</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Generative AI</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">LLMs</span>
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">React</span>
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">Web Development</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900">Learning Path</h3>
                <ul className="mt-3 space-y-3">
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                        1
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700"><span className="font-medium">Fundamentals:</span> Started with classical ML algorithms and statistical methods</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                        2
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700"><span className="font-medium">Deep Learning:</span> Explored neural networks with PyTorch and TensorFlow</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                        3
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700"><span className="font-medium">NLP Revolution:</span> Dove into transformer architectures and language models</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                        4
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700"><span className="font-medium">Computer Vision:</span> Worked with image recognition and generation models</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                        5
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700"><span className="font-medium">Current:</span> Exploring multimodal models and practical AI applications</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading text-gray-900 mb-4">Let's Connect</h2>
            <p className="text-gray-600 mb-6">
              Have questions about AI or want to collaborate on a project? Reach out to me!
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-y-3">
              <Button asChild>
                <Link href="/contact">Contact Me</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterForm />
    </>
  );
}
