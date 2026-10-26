import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Star,
  UserPlus,
  Users,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  Trash2,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import PocketBase from "pocketbase";

// Initialize PocketBase (Update this URL to match your server if hosted remotely)
//const pb = new PocketBase('http://127.0.0.1:8090');
const pb = new PocketBase("http://eq14x:8090");
pb.autoCancellation(false);

// ==========================================
// 1. LOCAL STORAGE KEYS (For device-specific state)
// ==========================================
const LS_ACTIVE_ID_KEY = "hop_math_active_student_local";

// ==========================================
// 2. CURRICULUM RULES & CONSTANTS
// ==========================================
const MATH_RULES = {
  "+1": {
    id: "+1",
    op: "+",
    val: 1,
    label: "+1",
    title: "The Number After",
    voiceRule: "Plus one means the number right after! Take one hop forward.",
    color: "from-emerald-400 to-green-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-400",
    text: "text-emerald-800",
  },
  "+2": {
    id: "+2",
    op: "+",
    val: 2,
    label: "+2",
    title: "Skip Count",
    voiceRule:
      "Plus two means skip count! Jump over one number to land on the next.",
    color: "from-teal-400 to-cyan-600",
    bgLight: "bg-teal-50",
    border: "border-teal-400",
    text: "text-teal-800",
  },
  "+3": {
    id: "+3",
    op: "+",
    val: 3,
    label: "+3",
    title: "Skip Count & One More",
    voiceRule: "Plus three means skip count, and add one more!",
    color: "from-blue-400 to-indigo-600",
    bgLight: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
  },
  "+4": {
    id: "+4",
    op: "+",
    val: 4,
    label: "+4",
    title: "Double a Skip Count",
    voiceRule:
      "Plus four means double a skip count! Add two, and then add two again.",
    color: "from-indigo-400 to-purple-600",
    bgLight: "bg-indigo-50",
    border: "border-indigo-400",
    text: "text-indigo-800",
  },
  "+5": {
    id: "+5",
    op: "+",
    val: 5,
    label: "+5",
    title: "Count Up By Five",
    voiceRule: "Plus five means count up by a group of five!",
    color: "from-purple-400 to-fuchsia-600",
    bgLight: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-800",
  },
  "+6": {
    id: "+6",
    op: "+",
    val: 6,
    label: "+6",
    title: "Add Five & One More",
    voiceRule: "Plus six means add five and one more!",
    color: "from-fuchsia-400 to-pink-600",
    bgLight: "bg-fuchsia-50",
    border: "border-fuchsia-400",
    text: "text-fuchsia-800",
  },
  "+7": {
    id: "+7",
    op: "+",
    val: 7,
    label: "+7",
    title: "Add Five & Two More",
    voiceRule: "Plus seven means add five and two more!",
    color: "from-rose-400 to-red-500",
    bgLight: "bg-rose-50",
    border: "border-rose-400",
    text: "text-rose-800",
  },
  "+8": {
    id: "+8",
    op: "+",
    val: 8,
    label: "+8",
    title: "Add Ten, Jump Back Two",
    voiceRule: "Plus eight means add ten and jump back two!",
    color: "from-red-400 to-orange-500",
    bgLight: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
  },
  "+9": {
    id: "+9",
    op: "+",
    val: 9,
    label: "+9",
    title: "Add Ten, Jump Back One",
    voiceRule: "Plus nine means add ten and jump back one!",
    color: "from-orange-400 to-amber-500",
    bgLight: "bg-orange-50",
    border: "border-orange-400",
    text: "text-orange-800",
  },
  "+10": {
    id: "+10",
    op: "+",
    val: 10,
    label: "+10",
    title: "Increase the Tens Place",
    voiceRule:
      "Plus ten means increase the tens place by one! Take a giant ten hop.",
    color: "from-amber-400 to-yellow-500",
    bgLight: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-800",
  },

  "-1": {
    id: "-1",
    op: "-",
    val: 1,
    label: "-1",
    title: "The Number Before",
    voiceRule:
      "Minus one means the number right before! Take one hop backward.",
    color: "from-lime-400 to-green-500",
    bgLight: "bg-lime-50",
    border: "border-lime-400",
    text: "text-lime-800",
  },
  "-2": {
    id: "-2",
    op: "-",
    val: 2,
    label: "-2",
    title: "Skip Count Backwards",
    voiceRule:
      "Minus two means skip count backwards! Jump backwards over one number.",
    color: "from-green-400 to-emerald-600",
    bgLight: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
  },
  "-3": {
    id: "-3",
    op: "-",
    val: 3,
    label: "-3",
    title: "Skip Back & One More",
    voiceRule: "Minus three means skip count backwards, and one more back!",
    color: "from-emerald-400 to-teal-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-400",
    text: "text-emerald-800",
  },
  "-4": {
    id: "-4",
    op: "-",
    val: 4,
    label: "-4",
    title: "Double Backward Skip",
    voiceRule:
      "Minus four means double a backward skip count! Subtract two twice.",
    color: "from-teal-400 to-cyan-600",
    bgLight: "bg-teal-50",
    border: "border-teal-400",
    text: "text-teal-800",
  },
  "-5": {
    id: "-5",
    op: "-",
    val: 5,
    label: "-5",
    title: "Count Down By Five",
    voiceRule: "Minus five means count down by a group of five!",
    color: "from-cyan-400 to-sky-600",
    bgLight: "bg-cyan-50",
    border: "border-cyan-400",
    text: "text-cyan-800",
  },
  "-6": {
    id: "-6",
    op: "-",
    val: 6,
    label: "-6",
    title: "Subtract Five & One More",
    voiceRule: "Minus six means subtract five and take away one more!",
    color: "from-sky-400 to-blue-600",
    bgLight: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-800",
  },
  "-7": {
    id: "-7",
    op: "-",
    val: 7,
    label: "-7",
    title: "Subtract Five & Two More",
    voiceRule: "Minus seven means subtract five and take away two more!",
    color: "from-blue-400 to-indigo-600",
    bgLight: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
  },
  "-8": {
    id: "-8",
    op: "-",
    val: 8,
    label: "-8",
    title: "Subtract Ten, Jump Forward Two",
    voiceRule: "Minus eight means subtract ten and jump forward two!",
    color: "from-indigo-400 to-violet-600",
    bgLight: "bg-indigo-50",
    border: "border-indigo-400",
    text: "text-indigo-800",
  },
  "-9": {
    id: "-9",
    op: "-",
    val: 9,
    label: "-9",
    title: "Subtract Ten, Jump Forward One",
    voiceRule: "Minus nine means subtract ten and jump forward one!",
    color: "from-violet-400 to-purple-600",
    bgLight: "bg-violet-50",
    border: "border-violet-400",
    text: "text-violet-800",
  },
  "-10": {
    id: "-10",
    op: "-",
    val: 10,
    label: "-10",
    title: "Decrease the Tens Place",
    voiceRule:
      "Minus ten means decrease the tens place by one! Take a giant ten hop backwards.",
    color: "from-purple-400 to-fuchsia-600",
    bgLight: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-800",
  },
};

const AVATARS = [
  {
    id: "frog",
    emoji: "🐸",
    name: "Freddy Frog",
    bg: "bg-green-200 border-green-500",
  },
  {
    id: "bunny",
    emoji: "🐰",
    name: "Bella Bunny",
    bg: "bg-pink-200 border-pink-500",
  },
  {
    id: "kangaroo",
    emoji: "🦘",
    name: "Kip Kangaroo",
    bg: "bg-amber-200 border-amber-500",
  },
  {
    id: "fox",
    emoji: "🦊",
    name: "Fiona Fox",
    bg: "bg-orange-200 border-orange-500",
  },
  {
    id: "unicorn",
    emoji: "🦄",
    name: "Una Unicorn",
    bg: "bg-purple-200 border-purple-500",
  },
  {
    id: "dino",
    emoji: "🦖",
    name: "Danny Dino",
    bg: "bg-teal-200 border-teal-500",
  },
];

const STICKER_DATA = [
  {
    tier: "Common",
    cost: 100,
    emojis:
      "🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶 🫑 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇",
  },
  {
    tier: "Uncommon",
    cost: 250,
    emojis:
      "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱",
  },
  {
    tier: "Rare",
    cost: 500,
    emojis: "🚗 🚕 🚙 🚌 🚎 🏎 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🛴 🚲 🛵 🏍 🛺 🚁",
  },
  { tier: "Legendary", cost: 1000, emojis: "💎 👑 🏆 🚀 🛸 🌋 🌌 🏰 🗽 🐉" },
];

const STICKERS = STICKER_DATA.flatMap((group) => {
  const chars = group.emojis.split(" ");
  return chars.map((char, i) => ({
    id: `s_${group.tier}_${i}`,
    emoji: char,
    name: `${group.tier} Item`,
    cost: group.cost,
    tier: group.tier,
  }));
});

// ==========================================
// 3. SOUND & SPEECH ENGINE
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }
  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      800,
      this.ctx.currentTime + 0.08,
    );
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }
  playHop(isBigSkip = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    const duration = isBigSkip ? 0.35 : 0.22;
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      isBigSkip ? 680 : 520,
      this.ctx.currentTime + duration * 0.6,
    );
    osc.frequency.exponentialRampToValueAtTime(
      380,
      this.ctx.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const startTime = this.ctx.currentTime + idx * 0.09;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.008, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.32);
    });
  }
  playGentleOops() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [350, 280];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const startTime = this.ctx.currentTime + idx * 0.15;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }
  speak(text) {
    if (
      this.muted ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    )
      return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  }
}
const sound = new SoundEngine();

// ==========================================
// 4. QUESTION GENERATOR HELPER
// ==========================================
function generateMathQuestion(ruleKey = "ALL", usedKeys = []) {
  const ruleKeys = Object.keys(MATH_RULES);
  let chosenRuleKey =
    ruleKey === "ALL"
      ? ruleKeys[Math.floor(Math.random() * ruleKeys.length)]
      : ruleKey;
  const rule = MATH_RULES[chosenRuleKey];

  let startNum = 5;
  let answer = 6;
  let attempts = 0;
  let generatedKey = "";

  do {
    let maxOpHop = rule.val;
    if (["+8", "+9", "+10"].includes(rule.id)) maxOpHop = 10;

    let minOpHop = rule.val;
    if (["-8", "-9", "-10"].includes(rule.id)) minOpHop = 10;

    if (rule.op === "+") {
      startNum = Math.floor(Math.random() * (30 - maxOpHop + 1));
      answer = startNum + rule.val;
    } else {
      startNum = Math.floor(Math.random() * (30 - minOpHop + 1)) + minOpHop;
      answer = startNum - rule.val;
    }

    generatedKey = `${startNum}${rule.id}`;
    attempts++;
  } while (usedKeys.includes(generatedKey) && attempts < 50);

  let steps = [];
  const s = startNum;

  switch (rule.id) {
    case "+1":
      steps = [
        { from: s, to: s + 1, skipped: null, label: "+1", voice: `${s + 1}!` },
      ];
      break;
    case "+2":
      steps = [
        {
          from: s,
          to: s + 2,
          skipped: s + 1,
          label: "Skip 1!",
          voice: `Skip to ${s + 2}!`,
        },
      ];
      break;
    case "+3":
      steps = [
        {
          from: s,
          to: s + 2,
          skipped: s + 1,
          label: "Skip 1!",
          voice: `Skip to ${s + 2}...`,
        },
        {
          from: s + 2,
          to: s + 3,
          skipped: null,
          label: "+1",
          voice: `And one more is ${s + 3}!`,
        },
      ];
      break;
    case "+4":
      steps = [
        {
          from: s,
          to: s + 2,
          skipped: s + 1,
          label: "Skip 2!",
          voice: `Two...`,
        },
        {
          from: s + 2,
          to: s + 4,
          skipped: s + 3,
          label: "Double it!",
          voice: `And two again makes ${s + 4}!`,
        },
      ];
      break;
    case "+5":
      steps = [
        {
          from: s,
          to: s + 5,
          skipped: null,
          label: "+5 Group!",
          voice: `A group of five makes ${s + 5}!`,
        },
      ];
      break;
    case "+6":
      steps = [
        { from: s, to: s + 5, skipped: null, label: "+5!", voice: `Five...` },
        {
          from: s + 5,
          to: s + 6,
          skipped: null,
          label: "+1 More!",
          voice: `And one more is ${s + 6}!`,
        },
      ];
      break;
    case "+7":
      steps = [
        { from: s, to: s + 5, skipped: null, label: "+5!", voice: `Five...` },
        {
          from: s + 5,
          to: s + 7,
          skipped: s + 6,
          label: "+2 More!",
          voice: `And two more makes ${s + 7}!`,
        },
      ];
      break;
    case "+8":
      steps = [
        {
          from: s,
          to: s + 10,
          skipped: null,
          label: "+10 Jump!",
          voice: `Add ten to ${s + 10}...`,
        },
        {
          from: s + 10,
          to: s + 8,
          skipped: null,
          label: "-2 Back!",
          voice: `And jump back two to ${s + 8}!`,
        },
      ];
      break;
    case "+9":
      steps = [
        {
          from: s,
          to: s + 10,
          skipped: null,
          label: "+10 Jump!",
          voice: `Add ten to ${s + 10}...`,
        },
        {
          from: s + 10,
          to: s + 9,
          skipped: null,
          label: "-1 Back!",
          voice: `And jump back one to ${s + 9}!`,
        },
      ];
      break;
    case "+10":
      steps = [
        {
          from: s,
          to: s + 10,
          skipped: null,
          label: "+10!",
          voice: `A giant ten hop to ${s + 10}!`,
        },
      ];
      break;

    case "-1":
      steps = [
        { from: s, to: s - 1, skipped: null, label: "-1", voice: `${s - 1}!` },
      ];
      break;
    case "-2":
      steps = [
        {
          from: s,
          to: s - 2,
          skipped: s - 1,
          label: "Skip 1 Back!",
          voice: `Skip back to ${s - 2}!`,
        },
      ];
      break;
    case "-3":
      steps = [
        {
          from: s,
          to: s - 2,
          skipped: s - 1,
          label: "Skip 1 Back!",
          voice: `Skip back to ${s - 2}...`,
        },
        {
          from: s - 2,
          to: s - 3,
          skipped: null,
          label: "-1",
          voice: `And one more back is ${s - 3}!`,
        },
      ];
      break;
    case "-4":
      steps = [
        {
          from: s,
          to: s - 2,
          skipped: s - 1,
          label: "Back 2!",
          voice: `Two back...`,
        },
        {
          from: s - 2,
          to: s - 4,
          skipped: s - 3,
          label: "Double it!",
          voice: `And two back again makes ${s - 4}!`,
        },
      ];
      break;
    case "-5":
      steps = [
        {
          from: s,
          to: s - 5,
          skipped: null,
          label: "-5 Group!",
          voice: `Five backwards to ${s - 5}!`,
        },
      ];
      break;
    case "-6":
      steps = [
        {
          from: s,
          to: s - 5,
          skipped: null,
          label: "-5!",
          voice: `Five back...`,
        },
        {
          from: s - 5,
          to: s - 6,
          skipped: null,
          label: "-1 More!",
          voice: `And one more back is ${s - 6}!`,
        },
      ];
      break;
    case "-7":
      steps = [
        {
          from: s,
          to: s - 5,
          skipped: null,
          label: "-5!",
          voice: `Five back...`,
        },
        {
          from: s - 5,
          to: s - 7,
          skipped: s - 6,
          label: "-2 More!",
          voice: `And two more back makes ${s - 7}!`,
        },
      ];
      break;
    case "-8":
      steps = [
        {
          from: s,
          to: s - 10,
          skipped: null,
          label: "-10 Jump!",
          voice: `Subtract ten to ${s - 10}...`,
        },
        {
          from: s - 10,
          to: s - 8,
          skipped: null,
          label: "+2 Forward!",
          voice: `And jump forward two to ${s - 8}!`,
        },
      ];
      break;
    case "-9":
      steps = [
        {
          from: s,
          to: s - 10,
          skipped: null,
          label: "-10 Jump!",
          voice: `Subtract ten to ${s - 10}...`,
        },
        {
          from: s - 10,
          to: s - 9,
          skipped: null,
          label: "+1 Forward!",
          voice: `And jump forward one to ${s - 9}!`,
        },
      ];
      break;
    case "-10":
      steps = [
        {
          from: s,
          to: s - 10,
          skipped: null,
          label: "-10!",
          voice: `A giant ten hop back to ${s - 10}!`,
        },
      ];
      break;
  }

  const optionsSet = new Set([answer]);
  while (optionsSet.size < 4) {
    const rand = Math.floor(Math.random() * 31);
    optionsSet.add(rand);
  }

  const sortedOptions = Array.from(optionsSet).sort((a, b) => a - b);

  return {
    key: `${startNum}${rule.id}`,
    startNum,
    rule,
    answer,
    options: sortedOptions,
    steps,
  };
}

// ==========================================
// NEW PROPORTIONAL REWARD ALGORITHM
// ==========================================
const calculateQuizReward = (quizCategory, correctAnswers) => {
  let multiplier = 1;

  if (["ALL", "ADD", "SUB"].includes(quizCategory)) {
    multiplier = 12;
  } else {
    const parsedValue = parseInt(quizCategory, 10);
    if (!isNaN(parsedValue)) {
      multiplier = Math.abs(parsedValue);
    }
  }

  const perQuestionReward = 2 * multiplier;
  let totalStars = correctAnswers * perQuestionReward;

  if (correctAnswers === 10) {
    totalStars += 5 * multiplier;
  }

  return totalStars;
};

// ==========================================
// 5. INTERACTIVE NUMBER LINE (MINIMIZED HEIGHT)
// ==========================================
function InteractiveNumberLine({
  question,
  mascotEmoji = "🐸",
  animStepIndex,
  showHintPreview = false,
  onNumberTap = null,
  selectedAnswer = null,
  isCorrect = null,
}) {
  const scrollContainerRef = useRef(null);
  const numbers = Array.from({ length: 31 }, (_, i) => i);
  const { startNum, rule, steps, answer } = question;

  let currentMascotNum = startNum;
  if (animStepIndex >= 0 && steps[animStepIndex]) {
    currentMascotNum = steps[animStepIndex].to;
  } else if (animStepIndex >= steps.length) {
    currentMascotNum = answer;
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const xPos = 30 + (currentMascotNum / 30) * 1740;
      const fraction = xPos / 1800;
      const scrollTarget =
        fraction * container.scrollWidth - container.clientWidth / 2;

      container.scrollTo({
        left: scrollTarget,
        behavior: "smooth",
      });
    }
  }, [currentMascotNum]);

  const visibleSteps = useMemo(() => {
    if (animStepIndex >= 0) return steps.slice(0, animStepIndex + 1);
    if (showHintPreview) return steps;
    return [];
  }, [animStepIndex, showHintPreview, steps]);

  const skippedNumbers = useMemo(() => {
    return visibleSteps.filter((s) => s.skipped !== null).map((s) => s.skipped);
  }, [visibleSteps]);

  const getX = (num) => 30 + (num / 30) * 1740;
  const baselineY = 85;

  return (
    <div className="w-full bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100 rounded-3xl p-1 sm:p-2 border-4 border-sky-300 shadow-inner relative overflow-hidden select-none">
      <div className="flex justify-center items-center min-h-[30px] mb-1">
        {animStepIndex >= 0 &&
        steps[Math.min(animStepIndex, steps.length - 1)] ? (
          <div className="bg-white/95 border-2 border-indigo-400 text-indigo-900 px-4 py-0.5 rounded-full font-extrabold text-sm sm:text-base shadow-sm animate-bounce">
            ✨ {steps[Math.min(animStepIndex, steps.length - 1)].label}
          </div>
        ) : showHintPreview ? (
          <div className="bg-amber-100 border-2 border-amber-400 text-amber-900 px-4 py-0.5 rounded-full font-bold text-sm sm:text-base shadow-sm">
            💡 Hint: {rule.title}
          </div>
        ) : (
          <div className="text-sky-800/80 font-bold text-sm">
            Start at{" "}
            <span className="bg-sky-200 px-1.5 py-0.5 rounded-md text-sky-950 font-black">
              {startNum}
            </span>
            !
          </div>
        )}
      </div>

      <div
        className="w-full overflow-x-auto no-scrollbar pb-1"
        ref={scrollContainerRef}
      >
        <svg
          viewBox="0 0 1800 120"
          className="w-full h-auto min-w-[1300px] overflow-visible"
        >
          <defs>
            <linearGradient id="hopGradAdd" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="hopGradSub" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          <line
            x1={getX(0)}
            y1={baselineY}
            x2={getX(30)}
            y2={baselineY}
            stroke="#94a3b8"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {visibleSteps.map((step, idx) => {
            const x1 = getX(step.from);
            const x2 = getX(step.to);
            const midX = (x1 + x2) / 2;
            const jumpSize = Math.abs(step.to - step.from);

            let arcHeight = 35;
            if (jumpSize >= 10) arcHeight = 60;
            else if (jumpSize >= 5) arcHeight = 50;
            else if (jumpSize >= 2) arcHeight = 45;

            const isBackwardJump = step.to < step.from;
            const ctrlY = baselineY - arcHeight;
            const strokeColor = !isBackwardJump
              ? "url(#hopGradAdd)"
              : "url(#hopGradSub)";

            return (
              <g key={idx}>
                <path
                  d={`M ${x1} ${baselineY - 10} Q ${midX} ${ctrlY} ${x2} ${baselineY - 10}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={jumpSize >= 5 ? "6" : "4"}
                  strokeDasharray={
                    showHintPreview && animStepIndex < 0 ? "8,6" : "none"
                  }
                  strokeLinecap="round"
                />
                <circle
                  cx={x2}
                  cy={baselineY - 10}
                  r="5"
                  fill={!isBackwardJump ? "#2563eb" : "#e11d48"}
                />
                <rect
                  x={midX - 35}
                  y={ctrlY + 5}
                  width="70"
                  height="20"
                  rx="10"
                  fill={!isBackwardJump ? "#dcfce7" : "#ffedd5"}
                  stroke={!isBackwardJump ? "#16a34a" : "#ea580c"}
                  strokeWidth="1.5"
                />
                <text
                  x={midX}
                  y={ctrlY + 19}
                  textAnchor="middle"
                  className="font-extrabold text-[11px]"
                  fill={!isBackwardJump ? "#14532d" : "#7c2d12"}
                >
                  {step.label}
                </text>
              </g>
            );
          })}

          {numbers.map((num) => {
            const cx = getX(num);
            const isStart = num === startNum;
            const isTarget =
              num === answer &&
              animStepIndex >= steps.length - 1 &&
              animStepIndex >= 0;
            const isSkipped = skippedNumbers.includes(num);
            const isIntermediate = visibleSteps.some(
              (s) => s.to === num && num !== answer,
            );
            const isUserSelected = selectedAnswer === num;

            let circleFill = "#ffffff";
            let circleStroke = "#cbd5e1";
            let textFill = "#334155";
            let radius = 18;

            if (isStart) {
              circleFill = "#fef08a";
              circleStroke = "#eab308";
              textFill = "#713f12";
              radius = 20;
            }
            if (isIntermediate) {
              circleFill = "#e0e7ff";
              circleStroke = "#6366f1";
              textFill = "#312e81";
            }
            if (isTarget || (isUserSelected && isCorrect)) {
              circleFill = "#4ade80";
              circleStroke = "#16a34a";
              textFill = "#064e3b";
              radius = 22;
            } else if (isUserSelected && isCorrect === false) {
              circleFill = "#fca5a5";
              circleStroke = "#dc2626";
              textFill = "#7f1d1d";
            } else if (isSkipped) {
              circleFill = "#f1f5f9";
              circleStroke = "#94a3b8";
              textFill = "#94a3b8";
            }

            return (
              <g
                key={num}
                onClick={() => onNumberTap && onNumberTap(num)}
                className={
                  onNumberTap
                    ? "cursor-pointer hover:opacity-90 transition-opacity"
                    : ""
                }
              >
                <circle
                  cx={cx}
                  cy={baselineY + 3}
                  r={radius}
                  fill="rgba(0,0,0,0.1)"
                />
                <circle
                  cx={cx}
                  cy={baselineY}
                  r={radius}
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth={isStart || isTarget ? "4" : "2.5"}
                />
                <text
                  x={cx}
                  y={baselineY + 6}
                  textAnchor="middle"
                  fill={textFill}
                  className="font-black text-[16px] select-none"
                >
                  {num}
                </text>
                {isSkipped && (
                  <line
                    x1={cx - 12}
                    y1={baselineY - 12}
                    x2={cx + 12}
                    y2={baselineY + 12}
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
              </g>
            );
          })}
          <g
            style={{
              transform: `translate(${getX(currentMascotNum)}px, ${baselineY - 32}px)`,
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="text-[34px] select-none filter drop-shadow-md"
            >
              {mascotEmoji}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 6. MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  const [students, setStudents] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeStudentId, setActiveStudentId] = useState(null);

  const [currentView, setCurrentView] = useState("PROFILES");
  const [soundMuted, setSoundMuted] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState(null);

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToReset, setStudentToReset] = useState(null);
  const [previewSticker, setPreviewSticker] = useState(null);

  // Dashboard state
  const [expandedQuizzes, setExpandedQuizzes] = useState({});

  // Practice State
  const [selectedRuleKey, setSelectedRuleKey] = useState("+1");
  const [practiceQuestion, setPracticeQuestion] = useState(() =>
    generateMathQuestion("+1"),
  );
  const [practiceSelectedAns, setPracticeSelectedAns] = useState(null);
  const [practiceIsCorrect, setPracticeIsCorrect] = useState(null);
  const [practiceAnimStep, setPracticeAnimStep] = useState(-1);
  const [practiceShowHint, setPracticeShowHint] = useState(false);
  const [practiceFirstTry, setPracticeFirstTry] = useState(true);
  const [practiceStreak, setPracticeStreak] = useState(0);

  // Quiz State
  const QUIZ_TOTAL_QUESTIONS = 10;
  const [quizRuleScope, setQuizRuleScope] = useState("ALL");
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizLockedChoice, setQuizLockedChoice] = useState(null);
  const [quizAnimStep, setQuizAnimStep] = useState(-1);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const animTimersRef = useRef([]);
  const clearAnimTimers = () => {
    animTimersRef.current.forEach((t) => clearTimeout(t));
    animTimersRef.current = [];
  };

  // Hydration from PocketBase & Local Storage (for device persistence)
  useEffect(() => {
    const loadData = async () => {
      try {
        const records = await pb.collection("students").getFullList({
          sort: "-created",
        });
        setStudents(records);

        const storedActiveId = localStorage.getItem(LS_ACTIVE_ID_KEY);
        if (storedActiveId && records.some((r) => r.id === storedActiveId)) {
          setActiveStudentId(storedActiveId);
        }
      } catch (e) {
        console.error("PocketBase read error", e);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Update Local Storage when active ID changes (client-specific tracking)
  useEffect(() => {
    try {
      if (activeStudentId)
        localStorage.setItem(LS_ACTIVE_ID_KEY, activeStudentId);
      else localStorage.removeItem(LS_ACTIVE_ID_KEY);
    } catch (e) {
      console.error("Local storage active ID write error", e);
    }
  }, [activeStudentId]);

  // Navigate to HOME if we have an active student upon load
  useEffect(() => {
    if (!isLoadingData && activeStudentId && currentView === "PROFILES") {
      const exists = students.some((s) => s.id === activeStudentId);
      if (exists) setCurrentView("HOME");
      else setActiveStudentId(null);
    }
  }, [isLoadingData, students, activeStudentId, currentView]);

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) || null,
    [students, activeStudentId],
  );

  const handleToggleMute = () => {
    setSoundMuted(!soundMuted);
    sound.muted = !soundMuted;
    if (!soundMuted) sound.playPop();
  };

  const triggerCelebration = (msg) => {
    setCelebrationMsg(msg);
    setTimeout(() => setCelebrationMsg(null), 2800);
  };

  /**
   * Functional state updater approach strictly adapted for PocketBase:
   * Updates React state optimistically and then syncs with PocketBase.
   */
  const updateActiveStudentState = async (updaterFn) => {
    if (!activeStudentId) return;

    // 1. Retrieve the current student directly from the component's state
    const currentStudent = students.find((s) => s.id === activeStudentId);
    if (!currentStudent) return;

    // 2. Calculate the new values (stars, ruleMastery, quizHistory, stickers)
    const updates = updaterFn(currentStudent);
    if ("stars" in updates) updates.stars = Number(updates.stars);

    // 3. Optimistically update the React UI immediately
    setStudents((prevStudents) =>
      prevStudents.map((s) =>
        s.id === activeStudentId ? { ...s, ...updates } : s,
      ),
    );

    // 4. Send only the updated fields to PocketBase
    try {
      await pb.collection("students").update(activeStudentId, updates);
    } catch (e) {
      console.error("PocketBase update error", e);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    sound.playPop();
    const initialMastery = {};
    Object.keys(MATH_RULES).forEach(
      (rk) => (initialMastery[rk] = { attempts: 0, correct: 0 }),
    );

    const newProfileData = {
      name: newStudentName.trim(),
      avatarId: selectedAvatar.id,
      avatarEmoji: selectedAvatar.emoji,
      stars: 2,
      stickers: [],
      ruleMastery: initialMastery,
      quizHistory: [],
    };

    try {
      const record = await pb.collection("students").create(newProfileData);
      setStudents((prev) => [...prev, record]);
      setNewStudentName("");
      setShowAddStudentModal(false);
      setActiveStudentId(record.id);
      setCurrentView("HOME");
      sound.speak(`Welcome ${record.name}! Let's hop!`);
    } catch (err) {
      console.error("PocketBase create error", err);
    }
  };

  const handleDeleteStudent = async (stuId) => {
    if (!stuId) return;
    try {
      await pb.collection("students").delete(stuId);
      setStudents((prev) => prev.filter((s) => s.id !== stuId));

      if (activeStudentId === stuId) {
        setActiveStudentId(null);
        setCurrentView("PROFILES");
      }
      setStudentToDelete(null);
    } catch (err) {
      console.error("PocketBase delete error", err);
    }
  };

  const handleResetStudent = async (stuId) => {
    if (!stuId) return;
    const initialMastery = {};
    Object.keys(MATH_RULES).forEach(
      (rk) => (initialMastery[rk] = { attempts: 0, correct: 0 }),
    );

    const resetData = {
      stars: 2,
      stickers: [],
      ruleMastery: initialMastery,
      quizHistory: [],
    };

    try {
      const updatedRecord = await pb
        .collection("students")
        .update(stuId, resetData);
      setStudents((prev) => {
        const studentIndex = prev.findIndex((s) => s.id === stuId);
        if (studentIndex === -1) return prev;

        const newS = [...prev];
        newS[studentIndex] = updatedRecord;
        return newS;
      });

      setStudentToReset(null);
      triggerCelebration("Progress Reset! 🌟");
    } catch (err) {
      console.error("PocketBase reset error", err);
    }
  };

  // Practice Mode
  const loadNewPracticeQuestion = (ruleKeyOverride = selectedRuleKey) => {
    clearAnimTimers();
    // Wrap the previous key in an array to match the new usedKeys parameter
    const nextQ = generateMathQuestion(
      ruleKeyOverride,
      practiceQuestion?.key ? [practiceQuestion.key] : [],
    );
    setPracticeQuestion(nextQ);
    setPracticeSelectedAns(null);
    setPracticeIsCorrect(null);
    setPracticeAnimStep(-1);
    setPracticeShowHint(false);
    setPracticeFirstTry(true);
    sound.speak(
      `What is ${nextQ.startNum} ${nextQ.rule.op === "+" ? "plus" : "minus"} ${nextQ.rule.val}?`,
    );
  };

  const playStepAnimationSequence = (q, onComplete) => {
    clearAnimTimers();
    setPracticeAnimStep(-1);
    q.steps.forEach((step, idx) => {
      const t = setTimeout(
        () => {
          setPracticeAnimStep(idx);
          sound.playHop(Math.abs(step.to - step.from) >= 2);
          sound.speak(step.voice);
        },
        idx * 1250 + 150,
      );
      animTimersRef.current.push(t);
    });
    if (onComplete) {
      const finalT = setTimeout(onComplete, q.steps.length * 1250 + 400);
      animTimersRef.current.push(finalT);
    }
  };

  const handlePracticeRuleSelect = (rk) => {
    sound.playPop();
    setSelectedRuleKey(rk);
    loadNewPracticeQuestion(rk);
  };

  const handleDemonstrateRule = () => {
    sound.playPop();
    setPracticeShowHint(true);
    playStepAnimationSequence(practiceQuestion);
  };

  const handlePracticeAnswerTap = (chosenNum) => {
    if (practiceIsCorrect === true) return;
    setPracticeSelectedAns(chosenNum);
    const isRight = chosenNum === practiceQuestion.answer;
    setPracticeIsCorrect(isRight);

    const rk = practiceQuestion.rule.id;

    if (isRight) {
      sound.playSuccess();
      const nextStreak = practiceStreak + 1;
      setPracticeStreak(nextStreak);
      playStepAnimationSequence(practiceQuestion);
      const starsEarned = nextStreak % 3 === 0 ? 2 : 1;
      if (nextStreak % 3 === 0)
        triggerCelebration(`🔥 ${nextStreak} in a Row! +2 Stars!`);
      else triggerCelebration(`⭐ Awesome Job! +1 Star!`);

      updateActiveStudentState((prevStudent) => {
        const prevMastery = prevStudent.ruleMastery || {};
        const prevStats = prevMastery[rk] || { attempts: 0, correct: 0 };
        return {
          stars: (prevStudent.stars || 0) + starsEarned,
          ruleMastery: {
            ...prevMastery,
            [rk]: {
              attempts: prevStats.attempts + (practiceFirstTry ? 1 : 0),
              correct: prevStats.correct + (practiceFirstTry ? 1 : 0),
            },
          },
        };
      });
    } else {
      sound.playGentleOops();
      setPracticeStreak(0);
      setPracticeShowHint(true);
      if (practiceFirstTry) {
        setPracticeFirstTry(false);
        updateActiveStudentState((prevStudent) => {
          const prevMastery = prevStudent.ruleMastery || {};
          const prevStats = prevMastery[rk] || { attempts: 0, correct: 0 };
          return {
            ruleMastery: {
              ...prevMastery,
              [rk]: {
                attempts: prevStats.attempts + 1,
                correct: prevStats.correct,
              },
            },
          };
        });
      }
      sound.speak(
        `Almost! Remember the rule: ${practiceQuestion.rule.voiceRule} Try again!`,
      );
    }
  };

  // Quiz Mode
  const startNewQuiz = (scope = "ALL") => {
    clearAnimTimers();
    sound.playPop();
    setQuizRuleScope(scope);

    const addRules = [
      "+1",
      "+2",
      "+3",
      "+4",
      "+5",
      "+6",
      "+7",
      "+8",
      "+9",
      "+10",
    ];
    const subRules = [
      "-1",
      "-2",
      "-3",
      "-4",
      "-5",
      "-6",
      "-7",
      "-8",
      "-9",
      "-10",
    ];

    let pool = [];
    if (scope === "ADD") {
      pool = addRules;
    } else if (scope === "SUB") {
      pool = subRules;
    } else if (scope === "ALL") {
      // Shuffle both arrays, slice 5 from each, and combine for a 50/50 split
      const randomAdd = [...addRules]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      const randomSub = [...subRules]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      pool = [...randomAdd, ...randomSub];
    } else {
      pool = [scope];
    }

    const generated = [];
    const usedKeys = []; // Array to track all questions in the current quiz

    for (let i = 0; i < QUIZ_TOTAL_QUESTIONS; i++) {
      // Since 'pool' is either length 10 or 1, i % pool.length distributes perfectly
      const q = generateMathQuestion(pool[i % pool.length], usedKeys);
      usedKeys.push(q.key);
      generated.push(q);
    }

    // Shuffle the final 10 questions so the 5 ADD and 5 SUB questions are mixed randomly
    generated.sort(() => Math.random() - 0.5);

    setQuizQuestions(generated);
    setQuizCurrentIndex(0);
    setQuizAnswers([]);
    setQuizLockedChoice(null);
    setQuizAnimStep(-1);
    setQuizCompleted(false);
    setQuizActive(true);
    setCurrentView("QUIZ");
    sound.speak(`Quiz time! Question 1.`);
  };

  const handleQuizAnswerTap = (chosenNum) => {
    if (quizLockedChoice !== null) return;
    setQuizLockedChoice(chosenNum);
    const currentQ = quizQuestions[quizCurrentIndex];
    const isRight = chosenNum === currentQ.answer;

    if (isRight) sound.playSuccess();
    else sound.playGentleOops();

    currentQ.steps.forEach((step, idx) => {
      const t = setTimeout(
        () => {
          setQuizAnimStep(idx);
          sound.playHop();
        },
        idx * 700 + 100,
      );
      animTimersRef.current.push(t);
    });

    const newAnswers = [
      ...quizAnswers,
      {
        questionKey: currentQ.key,
        equation: `${currentQ.startNum} ${currentQ.rule.id} = ${currentQ.answer}`,
        ruleId: currentQ.rule.id,
        chosen: chosenNum,
        correctAnswer: currentQ.answer,
        isCorrect: isRight,
      },
    ];

    setQuizAnswers(newAnswers);

    const advanceTimer = setTimeout(
      () => {
        if (quizCurrentIndex + 1 < quizQuestions.length) {
          setQuizCurrentIndex((prev) => prev + 1);
          setQuizLockedChoice(null);
          setQuizAnimStep(-1);
        } else {
          setQuizCompleted(true);
          const totalScore = newAnswers.filter((a) => a.isCorrect).length;
          const isPerfect = totalScore === quizQuestions.length;

          // Apply new proportional algorithm
          const starsReward = calculateQuizReward(quizRuleScope, totalScore);

          sound.playSuccess();
          sound.speak(
            isPerfect
              ? `Perfect score! You got ${totalScore} out of ${quizQuestions.length} and earned ${starsReward} stars!`
              : `Quiz complete! You earned ${starsReward} stars!`,
          );

          updateActiveStudentState((prevStudent) => {
            const updatedMastery = { ...(prevStudent.ruleMastery || {}) };

            newAnswers.forEach((ans) => {
              const st = updatedMastery[ans.ruleId] || {
                attempts: 0,
                correct: 0,
              };
              updatedMastery[ans.ruleId] = {
                attempts: st.attempts + 1,
                correct: st.correct + (ans.isCorrect ? 1 : 0),
              };
            });

            const newRecord = {
              id: `qz_${Date.now()}`,
              date: new Date().toLocaleDateString(),
              timestamp: Date.now(),
              scope: quizRuleScope === "ALL" ? "Mixed" : quizRuleScope,
              score: totalScore,
              total: quizQuestions.length,
              starsEarned: starsReward,
              questionsLog: newAnswers.map((ans) => ({
                equation: ans.equation,
                chosen: ans.chosen,
                correctAnswer: ans.correctAnswer,
                isCorrect: ans.isCorrect,
              })),
            };

            return {
              stars: (prevStudent.stars || 0) + starsReward,
              ruleMastery: updatedMastery,
              quizHistory: [
                newRecord,
                ...(prevStudent.quizHistory || []),
              ].slice(0, 50),
            };
          });
        }
      },
      currentQ.steps.length * 700 + 1100,
    );
    animTimersRef.current.push(advanceTimer);
  };

  const handleBuySticker = (sticker) => {
    if (!activeStudent) return;
    const owned = activeStudent.stickers || [];
    if (owned.includes(sticker.id))
      return sound.speak(`You already have this sticker!`);
    if ((activeStudent.stars || 0) < sticker.cost)
      return sound.speak(`You need ${sticker.cost} stars!`);

    sound.playSuccess();
    triggerCelebration(`🎉 Unlocked ${sticker.name}!`);

    updateActiveStudentState((prevStudent) => {
      const currentOwned = prevStudent.stickers || [];
      return {
        stars: (prevStudent.stars || 0) - sticker.cost,
        stickers: [...currentOwned, sticker.id],
      };
    });
  };

  const downloadStickerImage = (sticker) => {
    if (!activeStudent) return;
    sound.playPop();

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, "#e0e7ff");
    grad.addColorStop(1, "#fae8ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 584, 584);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 568, 568);

    ctx.fillStyle = "#312e81";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Certificate of Achievement`, 300, 80);
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(`Awarded to: ${activeStudent.name}`, 300, 130);

    ctx.font = "240px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(sticker.emoji, 300, 300);

    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(`${sticker.tier} Item`, 300, 480);

    ctx.fillStyle = "#b45309";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(`Value: ${sticker.cost} Stars ⭐`, 300, 540);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    const safeStudentName = activeStudent.name.trim().replace(/\s+/g, "_");
    const safeTier = sticker.tier.trim().replace(/\s+/g, "_");

    link.download = `${safeStudentName}_${safeTier}_${sticker.id}.png`;
    link.href = dataUrl;
    link.click();

    triggerCelebration("Image Downloaded! 📸");
  };

  const toggleQuizDetails = (quizId) => {
    setExpandedQuizzes((prev) => ({
      ...prev,
      [quizId]: !prev[quizId],
    }));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-950 flex-col gap-4">
        <RefreshCw className="w-12 h-12 animate-spin text-indigo-500" />
        <h2 className="text-xl font-black">Loading Application...</h2>
      </div>
    );
  }

  const renderTopNav = () => (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-indigo-200 px-4 py-2 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        {currentView !== "PROFILES" && (
          <button
            onClick={() => {
              clearAnimTimers();
              sound.playPop();
              if (currentView === "HOME") {
                setActiveStudentId(null);
                setCurrentView("PROFILES");
              } else {
                setCurrentView("HOME");
              }
            }}
            className="flex items-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-extrabold px-3 py-2 rounded-xl border-2 border-indigo-300"
          >
            {currentView === "HOME" ? (
              <Users className="w-5 h-5" />
            ) : (
              <Home className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {currentView === "HOME" ? "Switch Profile" : "Home"}
            </span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🐸</span>
          <h1 className="font-black text-lg sm:text-xl text-indigo-950 leading-none">
            Hop & Count
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {activeStudent && currentView !== "PROFILES" && (
          <>
            <button
              onClick={() => setCurrentView("STICKERS")}
              className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-xl border-2 border-amber-400"
            >
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="font-black text-amber-900">
                {activeStudent.stars || 0}
              </span>
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentView("DASHBOARD")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-bold text-sm ${currentView === "DASHBOARD" ? "bg-purple-600 text-white border-purple-700" : "bg-purple-100 text-purple-900 border-purple-300"}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="hidden md:inline">Dashboard</span>
        </button>
        <button
          onClick={handleToggleMute}
          className={`p-1.5 rounded-xl border-2 ${soundMuted ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-emerald-100 border-emerald-300 text-emerald-800"}`}
        >
          {soundMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );

  const renderProfilesView = () => (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 text-center mb-8">
        Pick Your Player!
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {students.map((stu) => {
          const avatar =
            AVATARS.find((a) => a.id === stu.avatarId) || AVATARS[0];
          return (
            <div
              key={stu.id}
              onClick={() => {
                sound.playPop();
                setActiveStudentId(stu.id);
                setCurrentView("HOME");
              }}
              className="bg-white rounded-3xl p-5 border-4 border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-lg flex flex-col items-center"
            >
              <div
                className={`w-24 h-24 rounded-full ${avatar.bg} border-4 flex items-center justify-center text-5xl mb-3`}
              >
                {stu.avatarEmoji}
              </div>
              <h3 className="font-black text-xl text-indigo-950 truncate">
                {stu.name}
              </h3>
            </div>
          );
        })}
        <button
          onClick={() => {
            setNewStudentName("");
            setShowAddStudentModal(true);
          }}
          className="bg-emerald-400 text-white rounded-3xl p-5 border-4 border-emerald-200 shadow-lg flex flex-col items-center justify-center min-h-[180px]"
        >
          <UserPlus className="w-12 h-12 mb-2" />
          <span className="font-black text-xl">New Profile</span>
        </button>
      </div>

      {showAddStudentModal && (
        <div className="fixed inset-0 bg-indigo-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 border-4 border-indigo-300 shadow-2xl">
            <h3 className="text-2xl font-black mb-4">Create Hopper</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <input
                type="text"
                required
                maxLength={15}
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Name..."
                className="w-full text-xl font-black p-3 rounded-xl border-2 border-indigo-200"
              />
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av)}
                    className={`p-2 rounded-xl text-3xl border-2 ${selectedAvatar.id === av.id ? "bg-indigo-100 border-indigo-500 scale-105" : "bg-slate-50"}`}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 p-3 rounded-xl bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 rounded-xl bg-emerald-500 text-white font-black"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderHomeView = () => {
    if (!activeStudent) return renderProfilesView();
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-pink-500 rounded-3xl p-5 text-white shadow-xl flex items-center gap-4">
          <div className="text-5xl">{activeStudent.avatarEmoji}</div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Hi, {activeStudent.name}!
            </h2>
            <p className="font-bold text-indigo-100 text-sm">
              Pick a rule below to Practice or Quiz!
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black text-indigo-950 mb-3 bg-emerald-100 inline-block px-3 py-1 rounded-lg">
            Addition Rules ➡️
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["+1", "+2", "+3", "+4", "+5", "+6", "+7", "+8", "+9", "+10"].map(
              (rk) => {
                const rule = MATH_RULES[rk];
                return (
                  <div
                    key={rk}
                    className={`${rule.bgLight} border-2 ${rule.border} rounded-2xl p-3 flex flex-col justify-between`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`bg-gradient-to-br ${rule.color} text-white font-black text-lg px-2 py-1 rounded-lg`}
                      >
                        {rule.label}
                      </span>
                    </div>
                    <h4 className={`font-black text-sm mt-2 ${rule.text}`}>
                      {rule.title}
                    </h4>
                    <div className="flex gap-1 mt-3">
                      <button
                        onClick={() => {
                          handlePracticeRuleSelect(rk);
                          setCurrentView("PRACTICE");
                        }}
                        className="flex-1 bg-white text-emerald-800 border-2 border-emerald-300 py-1 rounded-lg font-black text-xs"
                      >
                        Practice
                      </button>
                      <button
                        onClick={() => startNewQuiz(rk)}
                        className="flex-1 bg-emerald-500 text-white border-2 border-emerald-600 py-1 rounded-lg font-black text-xs"
                      >
                        Quiz
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black text-indigo-950 mb-3 bg-orange-100 inline-block px-3 py-1 rounded-lg">
            Subtraction Rules ⬅️
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-10"].map(
              (rk) => {
                const rule = MATH_RULES[rk];
                return (
                  <div
                    key={rk}
                    className={`${rule.bgLight} border-2 ${rule.border} rounded-2xl p-3 flex flex-col justify-between`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`bg-gradient-to-br ${rule.color} text-white font-black text-lg px-2 py-1 rounded-lg`}
                      >
                        {rule.label}
                      </span>
                    </div>
                    <h4 className={`font-black text-sm mt-2 ${rule.text}`}>
                      {rule.title}
                    </h4>
                    <div className="flex gap-1 mt-3">
                      <button
                        onClick={() => {
                          handlePracticeRuleSelect(rk);
                          setCurrentView("PRACTICE");
                        }}
                        className="flex-1 bg-white text-orange-800 border-2 border-orange-300 py-1 rounded-lg font-black text-xs"
                      >
                        Practice
                      </button>
                      <button
                        onClick={() => startNewQuiz(rk)}
                        className="flex-1 bg-orange-500 text-white border-2 border-orange-600 py-1 rounded-lg font-black text-xs"
                      >
                        Quiz
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPracticeView = () => {
    const { startNum, rule, answer, options } = practiceQuestion;
    return (
      <div className="max-w-4xl mx-auto px-2 py-4 space-y-3">
        <div
          className={`${rule.bgLight} border-2 ${rule.border} rounded-3xl p-3 shadow-sm flex items-center justify-between gap-2`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => sound.speak(rule.voiceRule)}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rule.color} text-white flex items-center justify-center shrink-0`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <h3 className={`font-black text-lg ${rule.text}`}>
              {rule.label}: {rule.title}
            </h3>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border-2 border-indigo-200 text-2xl font-black text-indigo-950">
            {startNum}{" "}
            <span
              className={
                rule.op === "+" ? "text-emerald-600" : "text-orange-500"
              }
            >
              {rule.id}
            </span>{" "}
            ={" "}
            <span className="text-slate-400">
              {practiceIsCorrect === true ? answer : "?"}
            </span>
          </div>
        </div>

        <InteractiveNumberLine
          question={practiceQuestion}
          mascotEmoji={activeStudent?.avatarEmoji}
          animStepIndex={practiceAnimStep}
          showHintPreview={practiceShowHint}
          onNumberTap={handlePracticeAnswerTap}
          selectedAnswer={practiceSelectedAns}
          isCorrect={practiceIsCorrect}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={handleDemonstrateRule}
            className="sm:col-span-4 bg-amber-100 py-2 rounded-2xl border-2 border-amber-400 text-amber-900 font-bold flex justify-center items-center gap-2"
          >
            <HelpCircle className="w-5 h-5" /> Show me the hops!
          </button>
          {practiceIsCorrect === true ? (
            <div className="sm:col-span-4 bg-emerald-100 border-2 border-emerald-500 rounded-3xl p-4 flex justify-between items-center">
              <span className="font-black text-xl text-emerald-900">
                Great Job!
              </span>
              <button
                onClick={() => loadNewPracticeQuestion()}
                className="bg-emerald-500 text-white font-black px-6 py-2 rounded-xl"
              >
                Next →
              </button>
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                onClick={() => handlePracticeAnswerTap(opt)}
                className={`py-4 rounded-2xl font-black text-2xl border-b-4 transition-all ${practiceSelectedAns === opt && practiceIsCorrect === false ? "bg-rose-200 border-rose-500 text-rose-900" : "bg-white border-indigo-300 text-indigo-950"}`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderQuizView = () => {
    if (quizCompleted) {
      const score = quizAnswers.filter((a) => a.isCorrect).length;
      const isPerfect = score === quizQuestions.length;

      // Calculate display reward using the new algorithm
      const reward = calculateQuizReward(quizRuleScope, score);

      return (
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-3xl border-4 border-indigo-300 p-8 shadow-xl">
            <h2 className="text-3xl font-black text-indigo-950 mb-4">
              Quiz Complete!
            </h2>
            <div className="text-4xl font-black text-amber-500 mb-6">
              Score: {score}/{quizQuestions.length}
            </div>

            {isPerfect ? (
              <div className="text-2xl font-bold text-emerald-600 mb-8 flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">🌟 Perfect Score! 🌟</span>
                <span>
                  You earned an amazing{" "}
                  <span className="font-black text-3xl">{reward}</span> Stars!
                </span>
              </div>
            ) : (
              <div className="text-lg font-bold text-indigo-600 mb-8 flex flex-col items-center justify-center gap-2">
                <span>Great effort! You are making progress.</span>
                <span className="text-2xl text-amber-500 font-black bg-amber-50 px-4 py-2 rounded-full border-2 border-amber-200">
                  +{reward} Stars Earned!
                </span>
              </div>
            )}

            <button
              onClick={() => setCurrentView("HOME")}
              className="bg-indigo-600 text-white font-black px-8 py-3 rounded-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    const currentQ = quizQuestions[quizCurrentIndex];
    const isAnswered = quizLockedChoice !== null;
    return (
      <div className="max-w-4xl mx-auto px-2 py-4 space-y-3">
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-amber-300">
          <span className="font-black text-amber-600 uppercase text-sm">
            No Retries
          </span>
          <span className="font-black text-indigo-900">
            Q {quizCurrentIndex + 1}/{quizQuestions.length}
          </span>
        </div>
        <div className="bg-indigo-50 p-4 rounded-3xl border-2 border-indigo-200 text-center text-4xl font-black text-indigo-950">
          {currentQ.startNum}{" "}
          <span
            className={
              currentQ.rule.op === "+" ? "text-emerald-600" : "text-orange-600"
            }
          >
            {currentQ.rule.id}
          </span>{" "}
          = {isAnswered ? currentQ.answer : "?"}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentQ.options.map((opt) => {
            let style = "bg-white border-indigo-300 text-indigo-950";
            if (isAnswered) {
              if (opt === currentQ.answer)
                style = "bg-emerald-500 border-emerald-700 text-white";
              else if (opt === quizLockedChoice)
                style = "bg-rose-500 border-rose-700 text-white";
              else style = "bg-slate-100 border-slate-200 text-slate-400";
            }
            return (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => handleQuizAnswerTap(opt)}
                className={`py-4 rounded-2xl font-black text-2xl border-b-4 ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDashboardView = () => (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-3xl p-5 border-4 border-purple-200 shadow-md">
        <h2 className="text-2xl font-black text-indigo-950 mb-4">
          Teacher Dashboard
        </h2>
        {students.map((stu) => {
          const mastery = stu.ruleMastery || {};
          return (
            <div
              key={stu.id}
              className="border-2 border-slate-200 rounded-2xl p-4 mb-4 bg-slate-50"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                <div className="font-black text-xl flex items-center gap-2">
                  <span>{stu.avatarEmoji}</span>
                  <span>{stu.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStudentToReset(stu)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold border border-amber-200 hover:bg-amber-200"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset Progress
                  </button>
                  <button
                    onClick={() => setStudentToDelete(stu)}
                    className="p-1.5 bg-rose-100 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm uppercase font-bold text-slate-500 mb-2">
                  Rule Mastery (Accuracy)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {Object.entries(mastery)
                    .filter(([_, stats]) => stats.attempts > 0)
                    .map(([rk, stats]) => {
                      const pct =
                        Math.round((stats.correct / stats.attempts) * 100) || 0;
                      let colorClass =
                        "text-slate-700 bg-slate-100 border-slate-200";
                      if (pct >= 80)
                        colorClass =
                          "text-emerald-800 bg-emerald-100 border-emerald-300";
                      else if (pct <= 50)
                        colorClass =
                          "text-rose-800 bg-rose-100 border-rose-300";

                      return (
                        <div
                          key={rk}
                          className={`border rounded-xl p-2 flex flex-col items-center justify-center ${colorClass}`}
                        >
                          <div className="font-black text-lg">{rk}</div>
                          <div className="text-xs font-bold">{pct}%</div>
                          <div className="text-[10px] opacity-70">
                            ({stats.correct}/{stats.attempts})
                          </div>
                        </div>
                      );
                    })}
                  {Object.values(mastery).every((m) => m.attempts === 0) && (
                    <div className="col-span-full text-slate-400 text-sm italic">
                      No rules practiced yet.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm uppercase font-bold text-slate-500 mb-2">
                  Quiz History
                </h4>
                {!(stu.quizHistory && stu.quizHistory.length > 0) ? (
                  <div className="text-slate-400 text-sm italic">
                    No quizzes taken yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stu.quizHistory.map((q) => {
                      const isExpanded = expandedQuizzes[q.id];
                      const isPerfect = q.score === q.total;
                      return (
                        <div
                          key={q.id}
                          className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm"
                        >
                          <div className="flex justify-between items-center p-3">
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-slate-500 font-medium">
                                {q.date}
                              </div>
                              <div className="font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {q.scope}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div
                                className={`font-black ${isPerfect ? "text-emerald-600" : "text-amber-600"}`}
                              >
                                Score: {q.score}/{q.total}
                              </div>
                              <button
                                onClick={() => toggleQuizDetails(q.id)}
                                className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg"
                              >
                                {isExpanded ? "Hide Details" : "View Details"}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {isExpanded && q.questionsLog && (
                            <div className="bg-slate-50 border-t-2 border-slate-200 p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.questionsLog.map((log, i) => (
                                  <div
                                    key={i}
                                    className={`flex justify-between items-center p-2 rounded border ${log.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                                  >
                                    <div className="font-bold text-slate-800">
                                      {log.equation}
                                    </div>
                                    <div className="text-sm">
                                      {log.isCorrect ? (
                                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                                          <CheckCircle2 className="w-4 h-4" />{" "}
                                          Correct
                                        </span>
                                      ) : (
                                        <span className="text-rose-700 font-bold flex items-center gap-1">
                                          <XCircle className="w-4 h-4" />{" "}
                                          Picked: {log.chosen} (Ans:{" "}
                                          {log.correctAnswer})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {studentToReset && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border-4 border-amber-400 text-center max-w-sm">
            <h3 className="text-xl font-black mb-2">
              Reset {studentToReset.name}?
            </h3>
            <p className="text-sm mb-4 text-slate-600">
              This erases stars, stickers, mastery stats, and all quiz history.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStudentToReset(null)}
                className="flex-1 p-2 bg-slate-200 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetStudent(studentToReset.id)}
                className="flex-1 p-2 bg-amber-500 text-white rounded-xl font-black"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border-4 border-rose-400 text-center max-w-sm">
            <h3 className="text-xl font-black mb-2">
              Delete {studentToDelete.name}?
            </h3>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 p-2 bg-slate-200 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(studentToDelete.id)}
                className="flex-1 p-2 bg-rose-600 text-white rounded-xl font-black"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStickersView = () => {
    if (!activeStudent) return renderProfilesView();
    const owned = activeStudent.stickers || [];
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-black text-indigo-950">Sticker Shop</h2>
          <div className="bg-amber-100 border-4 border-amber-400 text-amber-900 font-black text-2xl px-6 py-2 rounded-2xl flex items-center gap-2">
            ⭐ {activeStudent.stars || 0}
          </div>
        </div>
        <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl mb-6 text-indigo-900 font-bold text-center">
          Earn stars by practicing and taking quizzes! Harder rules give higher
          rewards, and perfect scores give a huge bonus!
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {STICKERS.map((st) => {
            const isOwned = owned.includes(st.id);
            let tierStyle =
              "bg-white hover:bg-slate-50 border-slate-200 text-slate-500";
            if (st.tier === "Common")
              tierStyle =
                "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100";
            if (st.tier === "Uncommon")
              tierStyle =
                "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100";
            if (st.tier === "Rare")
              tierStyle =
                "bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100";
            if (st.tier === "Legendary")
              tierStyle =
                "bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100";

            return (
              <div
                key={st.id}
                onClick={() =>
                  isOwned ? setPreviewSticker(st) : handleBuySticker(st)
                }
                className={`relative p-2 rounded-2xl border-4 text-center cursor-pointer transition-transform hover:scale-105 ${isOwned ? "bg-indigo-100 border-indigo-400 text-indigo-950 shadow-md scale-105 z-10" : tierStyle}`}
              >
                {isOwned && (
                  <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1.5 shadow border-2 border-white">
                    <Download size={14} />
                  </div>
                )}
                <div className={`text-4xl mb-1 filter drop-shadow-sm`}>
                  {st.emoji}
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider mb-1">
                  {st.tier}
                </div>
                <div className="text-xs font-black bg-white/80 rounded px-1 py-0.5">
                  {isOwned ? "Preview" : `${st.cost} ⭐`}
                </div>
              </div>
            );
          })}
        </div>

        {previewSticker && (
          <div className="fixed inset-0 bg-indigo-950/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-4 border-4 border-indigo-300 shadow-2xl relative">
              <div className="bg-gradient-to-br from-indigo-100 to-fuchsia-100 rounded-2xl border-8 border-indigo-400 p-6 flex flex-col items-center text-center mt-2 shadow-inner">
                <div className="border-4 border-white w-full h-full p-4 flex flex-col items-center rounded-xl shadow-sm bg-white/30 backdrop-blur-sm">
                  <h3 className="font-black text-2xl text-indigo-900 mb-1 uppercase tracking-wider">
                    Certificate of
                    <br />
                    Achievement
                  </h3>
                  <p className="font-bold text-md text-indigo-800 mb-6">
                    Awarded to:{" "}
                    <span className="font-black text-indigo-950">
                      {activeStudent.name}
                    </span>
                  </p>
                  <div className="text-8xl mb-6 filter drop-shadow-md">
                    {previewSticker.emoji}
                  </div>
                  <p className="font-black text-3xl text-indigo-950 mb-3">
                    {previewSticker.tier} Item
                  </p>
                  <p className="font-black text-lg text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-sm">
                    Value: {previewSticker.cost} Stars ⭐
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setPreviewSticker(null)}
                  className="flex-1 p-3 rounded-2xl bg-slate-100 border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    downloadStickerImage(previewSticker);
                    setPreviewSticker(null);
                  }}
                  className="flex-[2] p-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-6 h-6" /> Download PNG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-4 select-none">
      {renderTopNav()}
      {celebrationMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white font-black text-xl px-6 py-2 rounded-full shadow-lg border-2 border-white">
          {celebrationMsg}
        </div>
      )}
      <main>
        {currentView === "PROFILES" && renderProfilesView()}
        {currentView === "HOME" && renderHomeView()}
        {currentView === "PRACTICE" && renderPracticeView()}
        {currentView === "QUIZ" && renderQuizView()}
        {currentView === "STICKERS" && renderStickersView()}
        {currentView === "DASHBOARD" && renderDashboardView()}
      </main>
    </div>
  );
}
