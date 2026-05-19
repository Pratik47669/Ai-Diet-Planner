import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Heart, 
    Github, 
    Twitter, 
    Linkedin, 
    Mail,
    Sparkles,
    Shield,
    FileText,
    HelpCircle
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '/features' },
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'FAQ', href: '/faq' },
        ],
        company: [
            { label: 'About Us', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
            { label: 'Contact', href: '/contact' },
        ],
        legal: [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'Disclaimer', href: '/disclaimer' },
        ],
        support: [
            { label: 'Help Center', href: '/help' },
            { label: 'Documentation', href: '/docs' },
            { label: 'API Status', href: '/status' },
            { label: 'Report Bug', href: '/report' },
        ],
    };

    const socialLinks = [
        { icon: Github, href: 'https://github.com/nutriplan', label: 'GitHub' },
        { icon: Twitter, href: 'https://twitter.com/nutriplan', label: 'Twitter' },
        { icon: Linkedin, href: 'https://linkedin.com/company/nutriplan', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:support@nutriplan.com', label: 'Email' },
    ];

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-xl font-display text-primary-600">
                                NutriPlan AI
                            </span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            AI-powered personalized diet planning to help you achieve your health goals naturally and effectively.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                                {category}
                            </h3>
                            <ul className="space-y-2">
                                {links.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            © {currentYear} NutriPlan AI. All rights reserved.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <Link
                                to="/privacy"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                                Privacy
                            </Link>
                            <Link
                                to="/terms"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                                Terms
                            </Link>
                            <Link
                                to="/cookies"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                                Cookies
                            </Link>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for better health
                        </p>
                    </div>
                </div>

                {/* AI Disclaimer */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                            <strong>AI Disclaimer:</strong> The diet plans generated by NutriPlan AI are based on general nutritional guidelines and AI algorithms. They are not a substitute for professional medical advice. Always consult with a qualified healthcare provider before starting any diet or exercise program.
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;