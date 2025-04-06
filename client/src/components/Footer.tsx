import { Link } from "wouter";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold font-heading">I'm AI Man</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Documenting my journey through AI research, experiments, and applications.
            </p>
            <div className="flex space-x-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaGithub className="text-2xl" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaTwitter className="text-2xl" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaLinkedin className="text-2xl" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <SiHuggingface className="text-2xl" />
                <span className="sr-only">Hugging Face</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/projects" className="text-gray-300 hover:text-white">AI Projects</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Hugging Face</a></li>
              <li><a href="https://paperswithcode.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Papers With Code</a></li>
              <li><a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">arXiv</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">AI Research Tools</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} I'm AI Man. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
