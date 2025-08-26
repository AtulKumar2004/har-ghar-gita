import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Facebook,
    Instagram,
    Youtube,
    Menu,
    LogIn,
    X,
} from "lucide-react";

// Theme colors (tweak to taste)
const BG = "#2b1630"; // deep plum
const ACCENT = "#d9a85a"; // warm gold
// const ACCENT_DEEP = "#b78643";

// Use Framer Motion's anchor props to avoid TS drag signature conflicts
type PillProps = React.ComponentPropsWithoutRef<typeof motion.a>;

const IconBtn: React.FC<{
    as?: "a" | "button";
    href?: string;
    label: string;
    className?: string;
    onClick?: () => void;
    children: React.ReactNode;
}> = ({ as = "button", href, label, children, className = "", onClick }) => {
    const Base: any = as === "a" ? "a" : "button";
    return (
        <motion.span whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
            <Base
                href={href}
                aria-label={label}
                className={`group inline-grid h-9 w-9 place-items-center rounded-xl border transition-colors focus:outline-none focus:ring-2 ${className} border-[--accent]/60 text-[--accent] hover:bg-[--accent] hover:text-[--bg] focus:ring-[--accent]/60`}
                onClick={onClick}
                style={{ ['--accent' as any]: ACCENT, ['--bg' as any]: BG }}
            >
                <span className="[&>svg]:h-4 [&>svg]:w-4">{children}</span>
            </Base>
        </motion.span>
    );
};

const Pill: React.FC<PillProps> = ({ children, className = "", ...rest }) => (
    <motion.a
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm tracking-[0.18em] uppercase transition-colors ${className}`}
        style={{ ['--accent' as any]: ACCENT, ['--bg' as any]: BG }}
        {...rest}
    >
        {children}
    </motion.a>
);

export type NavbarProps = {
    className?: string;
};

export default function Navbar({ className = "" }: NavbarProps) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const openMenu = () => setOpen(true);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const firstFocusableRef = useRef<HTMLButtonElement | null>(null);

    // Lock body scroll while open
    useEffect(() => {
        let focusTimer: number | undefined;

        if (open) {
            document.body.style.overflow = "hidden";
            // schedule focusing; store id so we can clear if needed
            focusTimer = window.setTimeout(() => {
                firstFocusableRef.current?.focus();
            }, 0);
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            // cleanup: restore scrolling and clear timer
            document.body.style.overflow = "";
            if (focusTimer !== undefined) {
                clearTimeout(focusTimer);
            }
        };
    }, [open]);


    // Close on ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            <nav
                className={`sticky top-0 z-50 w-full border-b border-white/5 backdrop-blur supports-[backdrop-filter]:bg-[rgba(43,32,51,0.6)] ${className}`}
                role="navigation"
                aria-label="Primary"
                style={{
                    background: "linear-gradient(90deg, #228B22, #FFA500)"
                }}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between text-black px-4 py-3 md:px-6">
                    {/* Left cluster */}


                    {/* Center cluster: logo/home */}
                    <div className="hidden md:flex items-center gap-6 cursor-pointer">
                        <img src="/Logo.jpg" height={50} width={50} className="rounded-2xl" alt="" />
                    </div>

                    <div className="flex items-center font-bold text-2xl text-slate-700 gap-3 md:gap-4">
                        #HarGharGita
                    </div>

                    {/* Right cluster */}
                    <div className="flex items-center gap-3 md:gap-4 font-bold text-white">
                        <Pill href="#" className="hidden sm:inline-flex border-[--accent] text-[--accent] hover:bg-[--accent] hover:text-[--bg]">REGISTER</Pill>


                        {/* menu button visible on all sizes, but changes layout */}
                        <IconBtn as="button" label="Menu" onClick={openMenu} className="h-9 w-9 cursor-pointer">
                            <Menu />
                        </IconBtn>
                    </div>
                </div>
            </nav>

            {/* Sidebar + overlay */}
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-60 flex"
                    aria-hidden={!open}
                >
                    {/* overlay */}
                    <motion.button
                        onClick={close}
                        className="absolute inset-0 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-label="Close menu overlay"
                    />

                    {/* sidebar panel */}
                    <motion.aside
                        id="site-sidebar"
                        ref={sidebarRef}
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-70 w-80 max-w-full bg-gradient-to-b from-[#2E4C3F] via-[#3B5F46] to-[#8C4A2F] p-6 text-white overflow-y-auto"
                        style={{ paddingTop: "1rem" }}
                    >


                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[--accent] flex items-center justify-center text-[--bg] font-bold">
                                    <img src="/Logo.jpg" height={50} width={50} className="rounded-2xl" alt="" />
                                </div>
                                <div>
                                    <div className="font-semibold">#HarGharGita</div>
                                </div>
                            </div>

                            <button
                                ref={firstFocusableRef}
                                onClick={close}
                                aria-label="Close sidebar"
                                className="p-2 rounded-md border border-[--accent] text-[--accent] hover:bg-[--accent] hover:text-[--bg]"
                                style={{ ['--accent' as any]: ACCENT, ['--bg' as any]: BG }}
                            >
                                <X className="cursor-pointer" />
                            </button>
                        </div>

                        <nav className="mt-6 flex flex-col gap-3">
                            <a href="#" className="rounded-md px-3 py-2 hover:bg-white/5">Home</a>
                            <a href="#" className="rounded-md px-3 py-2 hover:bg-white/5">About</a>
                            <a href="#" className="rounded-md px-3 py-2 hover:bg-white/5">Programs</a>
                            <a href="#" className="rounded-md px-3 py-2 hover:bg-white/5">Events</a>
                            <a href="#" className="rounded-md px-3 py-2 hover:bg-white/5">Contact</a>
                        </nav>

                        <div className="mt-6">
                            <Pill href="#" className="w-full justify-center border-[--accent] text-[--accent] hover:bg-[--accent] hover:text-[--bg]">REGISTER</Pill>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <IconBtn as="a" href="#" label="Facebook">
                                <Facebook />
                            </IconBtn>
                            <IconBtn as="a" href="#" label="Instagram">
                                <Instagram />
                            </IconBtn>
                            <IconBtn as="a" href="#" label="YouTube">
                                <Youtube />
                            </IconBtn>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 text-xs opacity-70">© {new Date().getFullYear()} HarGharGita</div>
                    </motion.aside>
                </motion.div>
            )}
        </>
    );
}