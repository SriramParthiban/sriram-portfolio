"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registering here rather than in each component keeps registration to one
// place and guarantees it runs before any component's useGSAP fires.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

gsap.defaults({ ease: "power3.out", duration: 1 });

export { gsap, ScrollTrigger, SplitText, useGSAP };
