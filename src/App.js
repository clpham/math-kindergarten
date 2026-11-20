import React, { useState, useEffect, useRef, useMemo, useId } from "react";
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
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Plus,
  Minus,
} from "lucide-react";
import PocketBase from "pocketbase";
import pennyImg from "./coins/penny.png";
import nickelImg from "./coins/nickel.jpg";
import dimeImg from "./coins/dime.png";
import quarterImg from "./coins/quarter.png";

// Initialize PocketBase (Update this URL to match your server if hosted remotely)
const pb = new PocketBase("https://eq14x.tail2c693e.ts.net/pocketbase");
pb.autoCancellation(false);

// ==========================================
// 1. LOCAL STORAGE KEYS (For device-specific state)
// ==========================================
const LS_ACTIVE_ID_KEY = "hop_math_active_student_local";

// ==========================================
// 2. CURRICULUM RULES & CONSTANTS
// ==========================================
const COIN_SPECS = {
  quarter: {
    id: "quarter",
    name: "Quarter",
    value: 25,
    short: "Q",
    tip: "Biggest silver coin with ridged edges. Worth 25 cents!",
    sizeClass: "w-[82px] h-[82px] sm:w-[96px] sm:h-[96px]",
    imageUrl: quarterImg,
    //imageUrl:
    //  "https://commons.wikimedia.org/wiki/Special:FilePath/2014_ATB_Quarter_Obv.png?width=240",
    fallbackBg: "from-slate-200 to-slate-400 border-slate-600 text-slate-900",
  },
  nickel: {
    id: "nickel",
    name: "Nickel",
    value: 5,
    short: "N",
    tip: "Medium silver coin with smooth edges. Worth 5 cents!",
    sizeClass: "w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]",
    imageUrl: nickelImg,
    //imageUrl:
    //  "https://commons.wikimedia.org/wiki/Special:FilePath/Jefferson-Nickel-Unc-Obv.jpg?width=240",
    cropZoom: true, // trims JPEG corners to the circular rim
    fallbackBg: "from-stone-200 to-stone-400 border-stone-600 text-stone-900",
  },
  penny: {
    id: "penny",
    name: "Penny",
    value: 1,
    short: "P",
    tip: "Copper-brown coin with smooth edges. Worth 1 cent!",
    sizeClass: "w-[64px] h-[64px] sm:w-[76px] sm:h-[76px]",
    imageUrl: pennyImg,
    //imageUrl:
    //  "https://commons.wikimedia.org/wiki/Special:FilePath/US_One_Cent_Obv.png?width=240",
    fallbackBg: "from-amber-500 to-amber-700 border-amber-900 text-amber-950",
  },
  dime: {
    id: "dime",
    name: "Dime",
    value: 10,
    short: "D",
    tip: "Smallest silver coin with ridged edges. Worth 10 cents!",
    sizeClass: "w-[58px] h-[58px] sm:w-[70px] sm:h-[70px]",
    //imageUrl:
    //  "https://commons.wikimedia.org/wiki/Special:FilePath/Dime_Obverse_13.png?width=240",
    imageUrl: dimeImg,
    fallbackBg: "from-zinc-200 to-zinc-400 border-zinc-600 text-zinc-900",
  },
};
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

  // Skip & Sliding Counts
  COUNT5: {
    id: "COUNT5",
    op: "+",
    val: 5,
    max: 200,
    label: "Count by 5s",
    title: "Forward to 200",
    voiceRule: "Count up by fives! Every number ends in five or zero.",
    color: "from-pink-400 to-rose-600",
    bgLight: "bg-pink-50",
    border: "border-pink-400",
    text: "text-pink-800",
  },
  COUNT10: {
    id: "COUNT10",
    op: "+",
    val: 10,
    max: 200,
    label: "10s Forward",
    title: "Count up by 10s",
    voiceRule: "Count forward by tens! Add ten each hop.",
    color: "from-violet-400 to-purple-600",
    bgLight: "bg-violet-50",
    border: "border-violet-400",
    text: "text-violet-800",
  },
  COUNT10_BACK: {
    id: "COUNT10_BACK",
    op: "-",
    val: 10,
    max: 200,
    label: "10s Backward",
    title: "Count back by 10s",
    voiceRule: "Count backward by tens! Subtract ten each hop.",
    color: "from-fuchsia-500 to-purple-700",
    bgLight: "bg-fuchsia-50",
    border: "border-fuchsia-400",
    text: "text-fuchsia-800",
  },
  SLIDE10_FWD: {
    id: "SLIDE10_FWD",
    op: "+",
    val: 10,
    max: 200,
    sliding: true,
    label: "Slide 10s (+)",
    title: "Forward from Any #",
    voiceRule:
      "Sliding tens forward! Keep the ones digit the same and add ten.",
    color: "from-sky-400 to-indigo-600",
    bgLight: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-800",
  },
  SLIDE10_BACK: {
    id: "SLIDE10_BACK",
    op: "-",
    val: 10,
    max: 200,
    sliding: true,
    label: "Slide 10s (-)",
    title: "Back from Any #",
    voiceRule:
      "Sliding tens backward! Keep the ones digit the same and subtract ten.",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-800",
  },

  // Counting Coins Lessons
  COINS_PENNY: {
    id: "COINS_PENNY",
    category: "COINS",
    coinMode: "penny",
    op: "+",
    val: 2,
    label: "Pennies (1¢)",
    title: "Count by 1s",
    voiceRule: "Each penny is worth one cent! Count by ones.",
    color: "from-amber-600 to-orange-700",
    bgLight: "bg-amber-50",
    border: "border-amber-500",
    text: "text-amber-900",
  },
  COINS_NICKEL: {
    id: "COINS_NICKEL",
    category: "COINS",
    coinMode: "nickel",
    op: "+",
    val: 5,
    label: "Nickels (5¢)",
    title: "Count by 5s",
    voiceRule: "Each nickel is worth five cents! Count by fives.",
    color: "from-slate-500 to-stone-700",
    bgLight: "bg-stone-100",
    border: "border-stone-400",
    text: "text-stone-800",
  },
  COINS_DIME: {
    id: "COINS_DIME",
    category: "COINS",
    coinMode: "dime",
    op: "+",
    val: 6,
    label: "Dimes (10¢)",
    title: "Count by 10s",
    voiceRule: "Each dime is worth ten cents! Count by tens.",
    color: "from-sky-500 to-slate-600",
    bgLight: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-900",
  },
  COINS_QUARTER: {
    id: "COINS_QUARTER",
    category: "COINS",
    coinMode: "quarter",
    op: "+",
    val: 8,
    label: "Quarters (25¢)",
    title: "Count by 25s",
    voiceRule: "Each quarter is worth twenty-five cents! 25, 50, 75, 100!",
    color: "from-indigo-500 to-slate-700",
    bgLight: "bg-indigo-50",
    border: "border-indigo-400",
    text: "text-indigo-900",
  },
  COINS_MIXED: {
    id: "COINS_MIXED",
    category: "COINS",
    coinMode: "mixed",
    op: "+",
    val: 10,
    label: "Mixed Coins",
    title: "Count Biggest First",
    voiceRule:
      "Count the biggest value coins first, then add the smaller ones!",
    color: "from-yellow-500 to-amber-600",
    bgLight: "bg-yellow-50",
    border: "border-yellow-500",
    text: "text-amber-900",
  },

  // Place Value: 1, 2, and 3-Digit Numbers
  PV_1DIGIT: {
    id: "PV_1DIGIT",
    category: "PLACE_VALUE",
    pvMode: "1digit",
    op: "+",
    val: 2,
    label: "1-Digit (Ones)",
    title: "Numbers 1 to 9",
    voiceRule: "A one-digit number only has the Ones place!",
    color: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-400",
    text: "text-emerald-900",
  },
  PV_2DIGIT: {
    id: "PV_2DIGIT",
    category: "PLACE_VALUE",
    pvMode: "2digit",
    op: "+",
    val: 5,
    label: "2-Digit (T & O)",
    title: "Tens & Ones Place",
    voiceRule:
      "In a two-digit number, the left digit is Tens and the right digit is Ones!",
    color: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-900",
  },
  PV_3DIGIT: {
    id: "PV_3DIGIT",
    category: "PLACE_VALUE",
    pvMode: "3digit",
    op: "+",
    val: 8,
    label: "3-Digit (H, T, O)",
    title: "Hundreds, Tens & Ones",
    voiceRule:
      "In a three-digit number, read left to right: Hundreds, Tens, and Ones!",
    color: "from-purple-500 to-indigo-600",
    bgLight: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-900",
  },
  PV_MIXED: {
    id: "PV_MIXED",
    category: "PLACE_VALUE",
    pvMode: "mixed",
    op: "+",
    val: 10,
    label: "1, 2 & 3 Digits",
    title: "Digit Positions Mix",
    voiceRule:
      "Check each digit's position! Ones on the right, Tens in the middle, Hundreds on the left.",
    color: "from-fuchsia-500 to-indigo-600",
    bgLight: "bg-fuchsia-50",
    border: "border-fuchsia-400",
    text: "text-fuchsia-900",
  },
  // Telling Time (Clock)
  CLOCK_HOUR: {
    id: "CLOCK_HOUR",
    category: "CLOCK",
    clockMode: "hour",
    minuteSnap: 60,
    op: "+",
    val: 3,
    label: "O'Clock (:00)",
    title: "To the Hour",
    voiceRule:
      "When the long blue minute hand points straight up to 12, it is o'clock! Look at the short red hour hand.",
    color: "from-rose-500 to-red-600",
    bgLight: "bg-rose-50",
    border: "border-rose-400",
    text: "text-rose-900",
  },
  CLOCK_HALF: {
    id: "CLOCK_HALF",
    category: "CLOCK",
    clockMode: "half",
    minuteSnap: 30,
    op: "+",
    val: 5,
    label: "Half Past (:30)",
    title: "Hours & Half Hours",
    voiceRule:
      "When the long blue hand points straight down to 6, that is 30 minutes, or half past the hour!",
    color: "from-sky-500 to-indigo-600",
    bgLight: "bg-sky-50",
    border: "border-sky-400",
    text: "text-sky-900",
  },
  CLOCK_QUARTER: {
    id: "CLOCK_QUARTER",
    category: "CLOCK",
    clockMode: "quarter",
    minuteSnap: 15,
    op: "+",
    val: 7,
    label: "Quarters (:15/:45)",
    title: "Quarter Past & To",
    voiceRule:
      "Pointing to 3 means 15 minutes! Pointing to 9 means 45 minutes!",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    border: "border-violet-400",
    text: "text-violet-900",
  },
  CLOCK_FIVE: {
    id: "CLOCK_FIVE",
    category: "CLOCK",
    clockMode: "five",
    minuteSnap: 5,
    op: "+",
    val: 9,
    label: "By 5 Minutes",
    title: "Count by 5s on Clock",
    voiceRule:
      "Each big number on the clock is 5 minutes! Count by fives around the clock.",
    color: "from-teal-500 to-emerald-600",
    bgLight: "bg-teal-50",
    border: "border-teal-400",
    text: "text-teal-900",
  },
};

const SKIP_COUNT_RULES = [
  "COUNT5",
  "COUNT10",
  "COUNT10_BACK",
  "SLIDE10_FWD",
  "SLIDE10_BACK",
];

const COIN_RULES = [
  "COINS_PENNY",
  "COINS_NICKEL",
  "COINS_DIME",
  "COINS_QUARTER",
  "COINS_MIXED",
];

const PLACE_VALUE_RULES = ["PV_1DIGIT", "PV_2DIGIT", "PV_3DIGIT", "PV_MIXED"];

const CLOCK_RULES = ["CLOCK_HOUR", "CLOCK_HALF", "CLOCK_QUARTER", "CLOCK_FIVE"];

const ADDITION_RULES = [
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

const SUBTRACTION_RULES = [
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

const HOME_TABS = [
  {
    id: "ADD",
    label: "Addition",
    icon: "➕",
    title: "Addition Rules",
    subtitle: "Build mental math strategies from +1 to +10",
    activeClass:
      "bg-emerald-500 text-white border-emerald-700 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100",
    panelBorder: "border-emerald-300",
    panelHeader: "bg-emerald-50 border-emerald-200",
    rules: ADDITION_RULES,
    gridClass: "grid-cols-2 md:grid-cols-5",
  },
  {
    id: "SUB",
    label: "Subtraction",
    icon: "➖",
    title: "Subtraction Rules",
    subtitle: "Count back and use ten-jump tricks from -1 to -10",
    activeClass:
      "bg-orange-500 text-white border-orange-700 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100",
    panelBorder: "border-orange-300",
    panelHeader: "bg-orange-50 border-orange-200",
    rules: SUBTRACTION_RULES,
    gridClass: "grid-cols-2 md:grid-cols-5",
  },
  {
    id: "CHALLENGES",
    label: "Challenges",
    icon: "🏆",
    title: "Challenge Quizzes",
    subtitle: "Mixed 10-question quizzes covering Addition & Subtraction rules",
    activeClass:
      "bg-purple-600 text-white border-purple-800 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100",
    panelBorder: "border-purple-300",
    panelHeader: "bg-purple-50 border-purple-200",
  },
  {
    id: "SKIP",
    label: "Skip Count",
    icon: "🦘",
    title: "Skip & Sliding Counts (Up to 200)",
    subtitle: "Hop by 5s and 10s forward, backward, and from any number",
    activeClass:
      "bg-pink-500 text-white border-pink-700 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-pink-50 text-pink-900 border-pink-200 hover:bg-pink-100",
    panelBorder: "border-pink-300",
    panelHeader: "bg-pink-50 border-pink-200",
    rules: SKIP_COUNT_RULES,
    gridClass: "grid-cols-2 md:grid-cols-5",
  },
  {
    id: "PLACE_VALUE",
    label: "Place Value",
    icon: "🔢",
    title: "1, 2 & 3-Digit Numbers",
    subtitle: "Explore Ones, Tens, and Hundreds digit positions",
    activeClass:
      "bg-sky-500 text-white border-sky-700 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100",
    panelBorder: "border-sky-300",
    panelHeader: "bg-sky-50 border-sky-200",
    rules: PLACE_VALUE_RULES,
    gridClass: "grid-cols-2 md:grid-cols-4",
  },
  {
    id: "COINS",
    label: "Coins",
    icon: "🪙",
    title: "Counting Coins",
    subtitle: "Learn coin values and count pennies, nickels, dimes & quarters",
    activeClass:
      "bg-amber-500 text-white border-amber-700 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100",
    panelBorder: "border-amber-300",
    panelHeader: "bg-amber-50 border-amber-200",
    rules: COIN_RULES,
    gridClass: "grid-cols-2 md:grid-cols-5",
  },
  {
    id: "CLOCK",
    label: "Clock",
    icon: "🕐",
    title: "Telling Time",
    subtitle: "Move the hour and minute hands to read and set the clock",
    activeClass:
      "bg-rose-500 text-white border-rose-700 shadow-md scale-[1.02]",
    inactiveClass:
      "bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100",
    panelBorder: "border-rose-300",
    panelHeader: "bg-rose-50 border-rose-200",
    rules: CLOCK_RULES,
    gridClass: "grid-cols-2 md:grid-cols-4",
  },
];

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
    this.currentAudio = null;
    this.speechToken = 0;
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

  stop() {
    this.speechToken += 1;
    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.currentAudio = null;
      audio.pause();
      audio.currentTime = 0;
    }
  }

  async speak(text, { interrupt = false } = {}) {
    if (this.muted || typeof window === "undefined" || !text) return;

    if (interrupt) {
      this.stop();
    } else if (
      this.currentAudio &&
      !this.currentAudio.ended &&
      !this.currentAudio.paused
    ) {
      await waitForAudio(this.currentAudio);
    }

    const token = ++this.speechToken;

    try {
      const response = await fetch(
        "https://xps15.tail2c693e.ts.net:8443/v1/audio/speech",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "kokoro",
            input: text,
            voice: "af_bella(2)+af_sarah(1)+am_michael(1)",
            response_format: "mp3",
            speed: 1.0,
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 422) {
          const errorDetail = await response.json();
          console.error(
            "422 Validation Error details:",
            JSON.stringify(errorDetail, null, 2),
          );
        }
        throw new Error(`Kokoro TTS server error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      // Abort if another speech/stop call happened while fetching
      if (this.speechToken !== token || this.muted) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      await new Promise((resolve) => {
        const cleanup = () => {
          audio.removeEventListener("ended", cleanup);
          audio.removeEventListener("pause", cleanup);
          audio.removeEventListener("error", cleanup);
          URL.revokeObjectURL(audioUrl);
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
          resolve();
        };
        audio.addEventListener("ended", cleanup, { once: true });
        audio.addEventListener("pause", cleanup, { once: true });
        audio.addEventListener("error", cleanup, { once: true });
        audio.play().catch(cleanup);
      });
    } catch (error) {
      console.error("Failed to fetch audio from Kokoro:", error);
    }
  }
}

function waitForAudio(audioElement) {
  return new Promise((resolve) => {
    if (!audioElement || audioElement.ended || audioElement.paused) {
      resolve();
      return;
    }
    const done = () => {
      audioElement.removeEventListener("ended", done);
      audioElement.removeEventListener("pause", done);
      audioElement.removeEventListener("error", done);
      resolve();
    };
    audioElement.addEventListener("ended", done, { once: true });
    audioElement.addEventListener("pause", done, { once: true });
    audioElement.addEventListener("error", done, { once: true });
  });
}

const sound = new SoundEngine();

// ==========================================
// 4. QUESTION GENERATORS (NUMBER LINE, COINS, PLACE VALUE)
// ==========================================
function generateCoinQuestion(rule, usedKeys = []) {
  let coins = [];
  let answer = 0;
  let generatedKey = "";
  let attempts = 0;

  do {
    coins = [];
    if (rule.coinMode === "penny") {
      const count = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < count; i++) coins.push("penny");
    } else if (rule.coinMode === "nickel") {
      const count = Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < count; i++) coins.push("nickel");
    } else if (rule.coinMode === "dime") {
      const count = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < count; i++) coins.push("dime");
    } else if (rule.coinMode === "quarter") {
      const count = Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < count; i++) coins.push("quarter");
    } else {
      const q = Math.floor(Math.random() * 3);
      const d = Math.floor(Math.random() * 3);
      const n = Math.floor(Math.random() * 3);
      const p = Math.floor(Math.random() * 4);
      for (let i = 0; i < q; i++) coins.push("quarter");
      for (let i = 0; i < d; i++) coins.push("dime");
      for (let i = 0; i < n; i++) coins.push("nickel");
      for (let i = 0; i < p; i++) coins.push("penny");

      const distinctTypes = new Set(coins).size;
      if (coins.length < 2 || coins.length > 7 || distinctTypes < 2) {
        coins = ["dime", "nickel", "penny"];
      }
    }

    answer = coins.reduce((sum, type) => sum + COIN_SPECS[type].value, 0);
    generatedKey = `${rule.id}_${coins.join("-")}`;
    attempts++;
  } while (usedKeys.includes(generatedKey) && attempts < 50);

  let running = 0;
  const coinItems = coins.map((type, idx) => {
    const spec = COIN_SPECS[type];
    running += spec.value;
    return {
      idx,
      type,
      name: spec.name,
      value: spec.value,
      runningTotal: running,
    };
  });

  const steps = coinItems.map((c, idx) => ({
    coinIndex: idx,
    runningTotal: c.runningTotal,
    label: idx === 0 ? `${c.runningTotal}¢` : `+${c.value}¢ → ${c.runningTotal}¢`,
    voice:
      idx === 0
        ? `${c.runningTotal} cents`
        : `plus ${c.value} is ${c.runningTotal} cents`,
  }));

  const optionsSet = new Set([answer]);
  const coinCount = coins.length;
  const stepUnit =
    rule.coinMode === "penny"
      ? 1
      : rule.coinMode === "nickel"
        ? 5
        : rule.coinMode === "dime"
          ? 10
          : rule.coinMode === "quarter"
            ? 25
            : 5;

  if (coinCount !== answer && coinCount > 0 && Math.random() < 0.5) {
    optionsSet.add(coinCount);
  }

  let optAttempts = 0;
  while (optionsSet.size < 4 && optAttempts < 100) {
    optAttempts++;
    const offsets =
      rule.coinMode === "mixed"
        ? [-10, -5, -1, 1, 5, 10, 15, 25]
        : [-2 * stepUnit, -stepUnit, stepUnit, 2 * stepUnit, 3 * stepUnit];
    const delta = offsets[Math.floor(Math.random() * offsets.length)];
    const candidate = answer + delta;
    if (candidate > 0 && candidate !== answer) {
      optionsSet.add(candidate);
    }
  }

  const summaryCounts = ["quarter", "dime", "nickel", "penny"]
    .map((t) => {
      const cnt = coins.filter((c) => c === t).length;
      return cnt > 0 ? `${cnt}${COIN_SPECS[t].short}` : null;
    })
    .filter(Boolean)
    .join(" + ");

  return {
    key: generatedKey,
    rule,
    answer,
    answerUnit: "¢",
    options: Array.from(optionsSet).sort((a, b) => a - b),
    steps,
    coins: coinItems,
    promptText: "How much money is shown?",
    voicePrompt: "Count the coins! How many cents do you see?",
    equationLog: `${summaryCounts} = ${answer}¢`,
  };
}

function generatePlaceValueQuestion(rule, usedKeys = []) {
  let num = 5;
  let digitCount = 1;
  let qMode = "build_number";
  let targetPlace = "ones";
  let generatedKey = "";
  let attempts = 0;

  do {
    if (rule.pvMode === "1digit") {
      digitCount = 1;
    } else if (rule.pvMode === "2digit") {
      digitCount = 2;
    } else if (rule.pvMode === "3digit") {
      digitCount = 3;
    } else {
      digitCount = [1, 2, 3][Math.floor(Math.random() * 3)];
    }

    if (digitCount === 1) {
      num = Math.floor(Math.random() * 9) + 1;
      const modes =
        rule.pvMode === "mixed"
          ? ["build_number", "identify_digit", "digit_count"]
          : ["build_number", "identify_digit"];
      qMode = modes[Math.floor(Math.random() * modes.length)];
      targetPlace = "ones";
    } else if (digitCount === 2) {
      const t = Math.floor(Math.random() * 9) + 1;
      let o = Math.floor(Math.random() * 10);
      const modes =
        rule.pvMode === "mixed"
          ? ["build_number", "identify_digit", "digit_value", "digit_count"]
          : ["build_number", "identify_digit", "digit_value"];
      qMode = modes[Math.floor(Math.random() * modes.length)];
      if (qMode !== "build_number" && t === o) {
        o = (o + 3) % 10;
      }
      num = t * 10 + o;
      targetPlace = Math.random() < 0.55 ? "tens" : "ones";
    } else {
      const h = Math.floor(Math.random() * 9) + 1;
      let t = Math.floor(Math.random() * 10);
      let o = Math.floor(Math.random() * 10);
      const modes =
        rule.pvMode === "mixed"
          ? ["build_number", "identify_digit", "digit_value", "digit_count"]
          : ["build_number", "identify_digit", "digit_value"];
      qMode = modes[Math.floor(Math.random() * modes.length)];
      if (qMode === "digit_value" || qMode === "identify_digit") {
        while (t === h) t = Math.floor(Math.random() * 10);
        while (o === h || o === t) o = Math.floor(Math.random() * 10);
      }
      num = h * 100 + t * 10 + o;
      targetPlace = ["hundreds", "tens", "ones"][Math.floor(Math.random() * 3)];
    }

    generatedKey = `${rule.id}_${num}_${qMode}_${targetPlace}`;
    attempts++;
  } while (usedKeys.includes(generatedKey) && attempts < 50);

  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;
  const placeMap = { hundreds, tens, ones };
  const placeMultiplier = { hundreds: 100, tens: 10, ones: 1 };
  const placeLabel = {
    hundreds: "Hundreds",
    tens: "Tens",
    ones: "Ones",
  };

  let answer = num;
  let promptText = "";
  let voicePrompt = "";
  let equationLog = "";
  let steps = [];
  const optionsSet = new Set();

  if (qMode === "build_number") {
    answer = num;
    if (digitCount === 1) {
      promptText = `What number is ${ones} ${ones === 1 ? "One" : "Ones"}?`;
      voicePrompt = `Count the ones blocks! What one-digit number is ${ones} ones?`;
      equationLog = `${ones} Ones = ${num}`;
      steps = [
        {
          highlightPlace: "ones",
          label: `${ones} Ones = ${num}`,
          voice: `${ones} in the ones place makes ${num}!`,
        },
      ];
    } else if (digitCount === 2) {
      promptText = `What number is ${tens} Tens and ${ones} Ones?`;
      voicePrompt = `What two-digit number has ${tens} tens and ${ones} ones?`;
      equationLog = `${tens}T + ${ones}O = ${num}`;
      steps = [
        {
          highlightPlace: "tens",
          label: `${tens} Tens = ${tens * 10}`,
          voice: `${tens} tens is ${tens * 10}`,
        },
        {
          highlightPlace: "ones",
          label: `+ ${ones} Ones = ${num}`,
          voice: `and ${ones} ones makes ${num}!`,
        },
      ];
    } else {
      promptText = `What number is ${hundreds} Hundreds, ${tens} Tens, and ${ones} Ones?`;
      voicePrompt = `What three-digit number has ${hundreds} hundreds, ${tens} tens, and ${ones} ones?`;
      equationLog = `${hundreds}H + ${tens}T + ${ones}O = ${num}`;
      steps = [
        {
          highlightPlace: "hundreds",
          label: `${hundreds} Hundreds = ${hundreds * 100}`,
          voice: `${hundreds} hundreds is ${hundreds * 100}`,
        },
        {
          highlightPlace: "tens",
          label: `+ ${tens} Tens = ${hundreds * 100 + tens * 10}`,
          voice: `plus ${tens} tens is ${hundreds * 100 + tens * 10}`,
        },
        {
          highlightPlace: "ones",
          label: `+ ${ones} Ones = ${num}`,
          voice: `and ${ones} ones makes ${num}!`,
        },
      ];
    }

    optionsSet.add(answer);
    if (digitCount === 2 && ones > 0 && ones !== tens) {
      optionsSet.add(ones * 10 + tens);
    }
    if (digitCount === 3) {
      const swaps = [
        hundreds * 100 + ones * 10 + tens,
        tens * 100 + hundreds * 10 + ones,
        ones * 100 + tens * 10 + hundreds,
      ];
      swaps.forEach((s) => {
        if (s >= 100 && s !== answer && optionsSet.size < 4) optionsSet.add(s);
      });
    }
    while (optionsSet.size < 4) {
      const delta =
        digitCount === 1
          ? Math.floor(Math.random() * 9) + 1
          : digitCount === 2
            ? Math.max(
                10,
                Math.min(99, answer + (Math.floor(Math.random() * 21) - 10)),
              )
            : Math.max(
                100,
                Math.min(
                  999,
                  answer +
                    [-100, -10, -1, 1, 10, 100][Math.floor(Math.random() * 6)],
                ),
              );
      if (delta !== answer) optionsSet.add(delta);
    }
  } else if (qMode === "identify_digit") {
    answer = placeMap[targetPlace];
    promptText = `Which digit is in the ${placeLabel[targetPlace]} place of ${num}?`;
    voicePrompt = `Look at ${num}. Which digit is in the ${placeLabel[targetPlace]} place?`;
    equationLog = `${placeLabel[targetPlace]} digit of ${num} = ${answer}`;
    steps = [
      {
        highlightPlace: targetPlace,
        label: `${placeLabel[targetPlace]} place → ${answer}`,
        voice: `In ${num}, the digit ${answer} is in the ${placeLabel[targetPlace]} place!`,
      },
    ];

    optionsSet.add(answer);
    if (digitCount >= 2) optionsSet.add(tens);
    if (digitCount >= 1) optionsSet.add(ones);
    if (digitCount === 3) optionsSet.add(hundreds);
    while (optionsSet.size < 4) {
      optionsSet.add(Math.floor(Math.random() * 10));
    }
  } else if (qMode === "digit_value") {
    const targetDigit = placeMap[targetPlace];
    answer = targetDigit * placeMultiplier[targetPlace];
    promptText = `What is the value of the ${targetDigit} in ${num}?`;
    voicePrompt = `In ${num}, what is the value of the digit ${targetDigit}?`;
    equationLog = `Value of ${targetDigit} in ${num} = ${answer}`;
    steps = [
      {
        highlightPlace: targetPlace,
        label: `${targetDigit} in ${placeLabel[targetPlace]} = ${answer}`,
        voice: `The ${targetDigit} is in the ${placeLabel[targetPlace]} place, so its value is ${answer}!`,
      },
    ];

    optionsSet.add(answer);
    [targetDigit, targetDigit * 10, targetDigit * 100].forEach((v) => {
      if (v !== answer && optionsSet.size < 4 && (digitCount === 3 || v < 100)) {
        optionsSet.add(v);
      }
    });
    while (optionsSet.size < 4) {
      const otherDigit = Math.floor(Math.random() * 9) + 1;
      const mult =
        digitCount === 3
          ? [1, 10, 100][Math.floor(Math.random() * 3)]
          : [1, 10][Math.floor(Math.random() * 2)];
      const cand = otherDigit * mult;
      if (cand !== answer) optionsSet.add(cand);
    }
  } else {
    answer = digitCount;
    promptText = `How many digits are in ${num}?`;
    voicePrompt = `Count the digit positions in ${num}. How many digits does ${num} have?`;
    equationLog = `Digits in ${num} = ${digitCount}`;
    const placeNames =
      digitCount === 1
        ? "Ones"
        : digitCount === 2
          ? "Tens and Ones"
          : "Hundreds, Tens, and Ones";
    steps = [
      {
        highlightPlace: "all",
        label: `${digitCount} digit${digitCount > 1 ? "s" : ""} (${placeNames})`,
        voice: `${num} has ${digitCount} ${digitCount === 1 ? "digit" : "digits"}: ${placeNames}!`,
      },
    ];
    [1, 2, 3, 4].forEach((v) => optionsSet.add(v));
  }

  return {
    key: generatedKey,
    rule,
    answer,
    answerUnit: "",
    options: Array.from(optionsSet).sort((a, b) => a - b),
    steps,
    promptText,
    voicePrompt,
    equationLog,
    placeValue: {
      number: num,
      digitCount,
      hundreds,
      tens,
      ones,
      qMode,
      targetPlace,
      showAllColumns: rule.pvMode === "mixed" || digitCount === 3,
    },
  };
}

function formatClockTime(hour, minute) {
  const h = ((hour - 1 + 12) % 12) + 1;
  const m = String(minute).padStart(2, "0");
  return `${h}:${m}`;
}

function speakClockTime(hour, minute) {
  const h = ((hour - 1 + 12) % 12) + 1;
  if (minute === 0) return `${h} o'clock`;
  if (minute < 10) return `${h} oh ${minute}`;
  return `${h} ${minute}`;
}

function generateClockQuestion(rule, usedKeys = [], forceMode = null) {
  let hour = 3;
  let minute = 0;
  let qMode = forceMode || (Math.random() < 0.5 ? "set_clock" : "read_clock");
  let generatedKey = "";
  let attempts = 0;

  const allowedMinutes =
    rule.clockMode === "hour"
      ? [0]
      : rule.clockMode === "half"
        ? [0, 30]
        : rule.clockMode === "quarter"
          ? [0, 15, 30, 45]
          : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  do {
    hour = Math.floor(Math.random() * 12) + 1;
    minute = allowedMinutes[Math.floor(Math.random() * allowedMinutes.length)];
    generatedKey = `${rule.id}_${hour}_${minute}_${qMode}`;
    attempts++;
  } while (usedKeys.includes(generatedKey) && attempts < 50);

  const answer = formatClockTime(hour, minute);
  const spoken = speakClockTime(hour, minute);

  // Pick a different starting position for "set_clock"
  const startHour = ((hour + 5) % 12) + 1;
  const startMinute = minute === 0 ? 30 : 0;

  // Build 4 multiple-choice options for "read_clock"
  const optionsSet = new Set([answer]);
  let optAttempts = 0;
  while (optionsSet.size < 4 && optAttempts < 100) {
    optAttempts++;
    const candH =
      Math.random() < 0.6
        ? ((hour + (Math.random() < 0.5 ? 1 : -1) - 1 + 12) % 12) + 1
        : Math.floor(Math.random() * 12) + 1;
    const candM =
      allowedMinutes[Math.floor(Math.random() * allowedMinutes.length)];
    optionsSet.add(formatClockTime(candH, candM));
  }

  const minuteMark = minute === 0 ? 12 : minute / 5;
  const steps = [
    {
      phase: "hour",
      hour,
      minute: 0,
      label: `Red Hour hand → ${hour}`,
      voice: `The short red hour hand points to ${hour}.`,
    },
    {
      phase: "minute",
      hour,
      minute,
      label:
        minute === 0
          ? `Blue Minute hand → 12 (:00) = ${answer}`
          : `Blue Minute hand → ${minuteMark} (:${String(minute).padStart(2, "0")}) = ${answer}`,
      voice:
        minute === 0
          ? `The long blue minute hand points to 12 for o'clock! That is ${spoken}!`
          : `The long blue minute hand points to ${minuteMark}, which is ${minute} minutes! That is ${spoken}!`,
    },
  ];

  return {
    key: generatedKey,
    rule,
    answer,
    answerUnit: "",
    options: Array.from(optionsSet).sort((a, b) => {
      const [ah, am] = a.split(":").map(Number);
      const [bh, bm] = b.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    }),
    steps,
    promptText:
      qMode === "set_clock"
        ? `Move the hands to show ${answer}!`
        : "What time does the clock show?",
    voicePrompt:
      qMode === "set_clock"
        ? `Move the clock hands to show ${spoken}!`
        : "Look at the clock! What time is it?",
    equationLog: `Clock ${answer}`,
    clock: {
      hour,
      minute,
      startHour,
      startMinute,
      qMode,
      minuteSnap: rule.minuteSnap || 5,
    },
  };
}

function generateMathQuestion(
  ruleKey = "ALL",
  usedKeys = [],
  customStart = null,
) {
  const arithmeticKeys = Object.keys(MATH_RULES).filter(
    (k) => !MATH_RULES[k].category,
  );
  let chosenRuleKey =
    ruleKey === "ALL"
      ? arithmeticKeys[Math.floor(Math.random() * arithmeticKeys.length)]
      : ruleKey;
  const rule = MATH_RULES[chosenRuleKey];

  if (rule.category === "COINS") {
    return generateCoinQuestion(rule, usedKeys);
  }
  if (rule.category === "PLACE_VALUE") {
    return generatePlaceValueQuestion(rule, usedKeys);
  }
  if (rule.category === "CLOCK") {
    return generateClockQuestion(rule, usedKeys);
  }

  let startNum = 5;
  let answer = 6;
  let attempts = 0;
  let generatedKey = "";

  do {
    if (customStart !== null && rule.max) {
      if (rule.op === "-") {
        startNum = Math.max(rule.val, customStart);
        answer = startNum - rule.val;
      } else {
        startNum = Math.max(0, customStart);
        answer = startNum + rule.val;
      }
    } else if (rule.max === 200) {
      if (rule.sliding) {
        const ones = Math.floor(Math.random() * 9) + 1;
        if (rule.op === "+") {
          const tens = Math.floor(Math.random() * 19);
          startNum = tens * 10 + ones;
          answer = startNum + rule.val;
        } else {
          const tens = Math.floor(Math.random() * 19) + 1;
          startNum = tens * 10 + ones;
          answer = startNum - rule.val;
        }
      } else if (rule.op === "+") {
        const maxMultiplier = rule.max / rule.val - 1;
        const multiplier = Math.floor(Math.random() * maxMultiplier) + 1;
        startNum = multiplier * rule.val;
        answer = startNum + rule.val;
      } else {
        const maxMultiplier = rule.max / rule.val;
        const multiplier = Math.floor(Math.random() * maxMultiplier) + 1;
        startNum = multiplier * rule.val;
        answer = startNum - rule.val;
      }
    } else {
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
    }

    generatedKey = `${startNum}${rule.id}`;
    attempts++;
  } while (usedKeys.includes(generatedKey) && attempts < 50);

  let steps = [];
  const s = startNum;

  switch (rule.id) {
    case "+1":
      steps = [
        {
          from: s,
          to: s + 1,
          skipped: null,
          label: "+1",
          voice: `${s} to ${s + 1}!`,
        },
      ];
      break;
    case "+2":
      steps = [
        {
          from: s,
          to: s + 2,
          skipped: s + 1,
          label: "Skip 1!",
          voice: `${s} skips to ${s + 2}!`,
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
          voice: `${s} skips to ${s + 2}`,
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
          voice: `${s} skips two...`,
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
          voice: `${s} skips a group of five makes ${s + 5}!`,
        },
      ];
      break;
    case "+6":
      steps = [
        {
          from: s,
          to: s + 5,
          skipped: null,
          label: "+5!",
          voice: `${s} skips a group of five...`,
        },
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
        {
          from: s,
          to: s + 5,
          skipped: null,
          label: "+5!",
          voice: `${s} skips a group of five...`,
        },
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
    case "COUNT5":
    case "COUNT10":
    case "SLIDE10_FWD":
      steps = [
        {
          from: s,
          to: answer,
          skipped: null,
          label: `+${rule.val}!`,
          voice: `${s} plus ${rule.val} makes ${answer}!`,
        },
      ];
      break;
    case "COUNT10_BACK":
    case "SLIDE10_BACK":
      steps = [
        {
          from: s,
          to: answer,
          skipped: null,
          label: `-${rule.val}!`,
          voice: `${s} minus ${rule.val} makes ${answer}!`,
        },
      ];
      break;
  }

  const optionsSet = new Set([answer]);
  let optionAttempts = 0;
  while (optionsSet.size < 4 && optionAttempts < 100) {
    optionAttempts++;
    if (rule.max === 200) {
      const offsetSteps = [-3, -2, -1, 1, 2, 3, 4];
      const stepChoice =
        offsetSteps[Math.floor(Math.random() * offsetSteps.length)];
      const rand = answer + stepChoice * rule.val;
      if (rand >= 0 && rand !== answer && rand !== startNum) {
        optionsSet.add(rand);
      } else if (optionAttempts > 50 && rand >= 0 && rand !== answer) {
        optionsSet.add(rand);
      }
    } else {
      const rand = Math.floor(Math.random() * 31);
      optionsSet.add(rand);
    }
  }

  const sortedOptions = Array.from(optionsSet).sort((a, b) => a - b);

  return {
    key: `${startNum}${rule.id}`,
    startNum,
    rule,
    answer,
    answerUnit: "",
    options: sortedOptions,
    steps,
    voicePrompt: `What is ${startNum} ${rule.op === "+" ? "plus" : "minus"} ${rule.val}?`,
    equationLog: `${startNum} ${rule.op}${rule.val} = ${answer}`,
  };
}

// ==========================================
// PROPORTIONAL REWARD ALGORITHM
// ==========================================
const calculateQuizReward = (quizCategory, correctAnswers) => {
  let multiplier = 1;

  if (["ALL", "ADD", "SUB"].includes(quizCategory)) {
    multiplier = 12;
  } else if (MATH_RULES[quizCategory]) {
    multiplier = MATH_RULES[quizCategory].val;
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
// SHARED BASE-10 BLOCK RENDERER
// ==========================================
function renderBase10Blocks(colId, count) {
  if (count === 0) {
    return (
      <span className="text-xs font-bold text-slate-400 italic py-4">
        0 {colId}
      </span>
    );
  }
  if (colId === "hundreds") {
    return (
      <div className="flex flex-wrap justify-center gap-1.5 max-w-[160px]">
        {Array.from({ length: count }).map((_, i) => (
          <svg
            key={i}
            width="34"
            height="34"
            viewBox="0 0 34 34"
            className="drop-shadow-sm"
          >
            <rect
              x="1"
              y="1"
              width="32"
              height="32"
              rx="3"
              fill="#a855f7"
              stroke="#6b21a8"
              strokeWidth="2"
            />
            {[9, 17, 25].map((pos) => (
              <g key={pos}>
                <line
                  x1={pos}
                  y1="2"
                  x2={pos}
                  y2="32"
                  stroke="#e9d5ff"
                  strokeWidth="1"
                />
                <line
                  x1="2"
                  y1={pos}
                  x2="32"
                  y2={pos}
                  stroke="#e9d5ff"
                  strokeWidth="1"
                />
              </g>
            ))}
          </svg>
        ))}
      </div>
    );
  }
  if (colId === "tens") {
    return (
      <div className="flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <svg
            key={i}
            width="12"
            height="46"
            viewBox="0 0 12 46"
            className="drop-shadow-sm"
          >
            <rect
              x="1"
              y="1"
              width="10"
              height="44"
              rx="2"
              fill="#0ea5e9"
              stroke="#0369a1"
              strokeWidth="1.5"
            />
            {[10, 19, 28, 37].map((y) => (
              <line
                key={y}
                x1="2"
                y1={y}
                x2="10"
                y2={y}
                stroke="#bae6fd"
                strokeWidth="1"
              />
            ))}
          </svg>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-[120px]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-sm bg-emerald-500 border-2 border-emerald-700 shadow-sm"
        />
      ))}
    </div>
  );
}

// ==========================================
// 5A. INTERACTIVE NUMBER LINE
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
  const { startNum, rule, steps, answer } = question;

  let maxAxis = rule.max || 30;
  const highestNum = Math.max(startNum, answer);
  if (rule.max && highestNum > maxAxis) {
    maxAxis = Math.ceil(highestNum / rule.val) * rule.val + rule.val * 2;
  }
  const getX = (num) => 30 + (num / maxAxis) * 1740;

  let currentMascotNum = startNum;
  if (animStepIndex >= 0 && steps[animStepIndex]) {
    currentMascotNum = steps[animStepIndex].to;
  } else if (animStepIndex >= steps.length) {
    currentMascotNum = answer;
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const xPos = getX(currentMascotNum);
      const fraction = xPos / 1800;
      const scrollTarget =
        fraction * container.scrollWidth - container.clientWidth / 2;

      container.scrollTo({
        left: scrollTarget,
        behavior: "smooth",
      });
    }
  }, [currentMascotNum]);

  const axisStep = rule.max ? rule.val : 1;
  const axisOffset = rule.max ? startNum % axisStep : 0;
  const numbers = [];
  for (let n = axisOffset; n <= maxAxis; n += axisStep) {
    numbers.push(n);
  }
  if (!numbers.includes(startNum)) numbers.push(startNum);
  if (!numbers.includes(answer)) numbers.push(answer);
  numbers.sort((a, b) => a - b);

  const visibleSteps = useMemo(() => {
    if (animStepIndex >= 0) return steps.slice(0, animStepIndex + 1);
    if (showHintPreview) return steps;
    return [];
  }, [animStepIndex, showHintPreview, steps]);

  const skippedNumbers = useMemo(() => {
    return visibleSteps.filter((s) => s.skipped !== null).map((s) => s.skipped);
  }, [visibleSteps]);

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
            x2={getX(maxAxis)}
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

function USCoin({ type, className = "" }) {
  const spec = COIN_SPECS[type] || COIN_SPECS.penny;
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className={`${spec.sizeClass} rounded-full bg-gradient-to-br ${spec.fallbackBg} border-4 shadow-md flex flex-col items-center justify-center shrink-0 select-none ${className}`}
      >
        <span className="font-black text-base leading-none">{spec.value}¢</span>
        <span className="font-bold text-[9px] uppercase mt-0.5">
          {spec.name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${spec.sizeClass} rounded-full overflow-hidden drop-shadow-md shrink-0 select-none ${className}`}
    >
      <img
        src={spec.imageUrl}
        alt={`${spec.name} (${spec.value}¢)`}
        onError={() => setImgFailed(true)}
        draggable={false}
        className={`w-full h-full object-cover ${spec.cropZoom ? "scale-[1.06]" : ""}`}
      />
    </div>
  );
}
// ==========================================
// 5B. INTERACTIVE COIN BOARD
// ==========================================
function InteractiveCoinBoard({
  question,
  animStepIndex,
  showHintPreview = false,
}) {
  const { coins = [], steps = [], rule } = question;

  return (
    <div className="w-full bg-gradient-to-b from-amber-50 via-yellow-50 to-emerald-50 rounded-3xl p-4 sm:p-5 border-4 border-amber-300 shadow-inner select-none">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="text-amber-900 font-black text-base sm:text-lg">
          🪙 {question.promptText}
        </div>
        {animStepIndex >= 0 &&
        steps[Math.min(animStepIndex, steps.length - 1)] ? (
          <div className="bg-white border-2 border-indigo-400 text-indigo-900 px-4 py-1 rounded-full font-black text-sm sm:text-base shadow-sm animate-bounce">
            ✨ {steps[Math.min(animStepIndex, steps.length - 1)].label}
          </div>
        ) : showHintPreview ? (
          <div className="bg-amber-100 border-2 border-amber-400 text-amber-900 px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
            💡 Quarter=25¢ · Dime=10¢ · Nickel=5¢ · Penny=1¢
          </div>
        ) : (
          <div className="text-amber-800/80 font-bold text-xs sm:text-sm">
            {rule.title}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-end gap-4 sm:gap-5 py-3 min-h-[120px]">
        {coins.map((c, idx) => {
          const spec = COIN_SPECS[c.type];
          const isCounted = animStepIndex >= idx;
          const isCurrent = animStepIndex === idx;

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
            <USCoin
                type={c.type}
                className={`transition-transform duration-300 ${
                  isCurrent
                    ? "scale-110 ring-4 ring-emerald-400 -translate-y-1.5"
                    : isCounted
                      ? "ring-2 ring-emerald-400"
                      : ""
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 5C. INTERACTIVE PLACE VALUE BOARD (1, 2 & 3-DIGIT)
// ==========================================
function InteractivePlaceValueBoard({
  question,
  animStepIndex,
  showHintPreview = false,
  isAnsweredCorrectly = false,
}) {
  const { placeValue, steps = [] } = question;
  if (!placeValue) return null;

  const {
    number,
    digitCount,
    hundreds,
    tens,
    ones,
    qMode,
    targetPlace,
    showAllColumns,
  } = placeValue;

  const activeHighlight =
    animStepIndex >= 0 && steps[Math.min(animStepIndex, steps.length - 1)]
      ? steps[Math.min(animStepIndex, steps.length - 1)].highlightPlace
      : showHintPreview && qMode !== "build_number"
        ? targetPlace
        : null;

  const showNumberDigits =
    qMode !== "build_number" || isAnsweredCorrectly || animStepIndex >= 0;

  const columns = [];
  if (showAllColumns || digitCount === 3) {
    columns.push({
      id: "hundreds",
      title: "Hundreds",
      value: hundreds,
      active: digitCount >= 3,
      bg: "bg-purple-50",
      border: "border-purple-300",
      ring: "ring-purple-500 bg-purple-100",
      badge: "bg-purple-600 text-white",
      text: "text-purple-900",
    });
  }
  if (showAllColumns || digitCount >= 2) {
    columns.push({
      id: "tens",
      title: "Tens",
      value: tens,
      active: digitCount >= 2,
      bg: "bg-sky-50",
      border: "border-sky-300",
      ring: "ring-sky-500 bg-sky-100",
      badge: "bg-sky-600 text-white",
      text: "text-sky-900",
    });
  }
  columns.push({
    id: "ones",
    title: "Ones",
    value: ones,
    active: true,
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    ring: "ring-emerald-500 bg-emerald-100",
    badge: "bg-emerald-600 text-white",
    text: "text-emerald-900",
  });

  return (
    <div className="w-full bg-gradient-to-b from-indigo-50 via-white to-purple-50 rounded-3xl p-4 sm:p-5 border-4 border-indigo-300 shadow-inner select-none space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="text-indigo-950 font-black text-base sm:text-xl">
          🔢 {question.promptText}
        </div>
        {animStepIndex >= 0 &&
        steps[Math.min(animStepIndex, steps.length - 1)] ? (
          <div className="bg-white border-2 border-indigo-400 text-indigo-900 px-4 py-1 rounded-full font-black text-sm shadow-sm animate-bounce">
            ✨ {steps[Math.min(animStepIndex, steps.length - 1)].label}
          </div>
        ) : showHintPreview ? (
          <div className="bg-amber-100 border-2 border-amber-400 text-amber-900 px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
            💡 Look at each digit's column!
          </div>
        ) : null}
      </div>

      {qMode !== "build_number" && (
        <div className="flex justify-center items-center gap-2 py-1">
          {String(number)
            .split("")
            .map((ch, idx, arr) => {
              const posFromRight = arr.length - 1 - idx;
              const placeName =
                posFromRight === 2
                  ? "hundreds"
                  : posFromRight === 1
                    ? "tens"
                    : "ones";
              const isHighlighted =
                (qMode === "digit_value" && placeName === targetPlace) ||
                activeHighlight === placeName ||
                activeHighlight === "all";

              const colorByPlace =
                placeName === "hundreds"
                  ? "text-purple-700 border-purple-400 bg-purple-100"
                  : placeName === "tens"
                    ? "text-sky-700 border-sky-400 bg-sky-100"
                    : "text-emerald-700 border-emerald-400 bg-emerald-100";

              return (
                <div
                  key={idx}
                  className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-4 flex items-center justify-center text-4xl sm:text-5xl font-black transition-all ${
                    isHighlighted
                      ? `${colorByPlace} scale-110 shadow-md ring-4 ring-amber-400`
                      : "bg-white border-slate-300 text-indigo-950"
                  }`}
                >
                  {ch}
                </div>
              );
            })}
        </div>
      )}

      <div
        className={`grid gap-3 ${
          columns.length === 1
            ? "grid-cols-1 max-w-xs mx-auto"
            : columns.length === 2
              ? "grid-cols-2 max-w-lg mx-auto"
              : "grid-cols-3"
        }`}
      >
        {columns.map((col) => {
          const isLit =
            activeHighlight === col.id || activeHighlight === "all";
          const showDigitInCol =
            col.active &&
            (showNumberDigits ||
              (qMode === "build_number" &&
                steps
                  .slice(0, animStepIndex + 1)
                  .some((s) => s.highlightPlace === col.id)));

          return (
            <div
              key={col.id}
              className={`rounded-2xl border-2 p-3 flex flex-col items-center justify-between min-h-[140px] transition-all ${
                !col.active
                  ? "bg-slate-100/70 border-slate-200 opacity-45"
                  : isLit
                    ? `${col.border} ${col.ring} ring-4 scale-[1.02] shadow-md`
                    : `${col.bg} ${col.border}`
              }`}
            >
              <span
                className={`px-3 py-0.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider ${
                  col.active ? col.badge : "bg-slate-300 text-slate-600"
                }`}
              >
                {col.title}
              </span>

              <div className="my-2 flex items-center justify-center flex-1">
                {col.active ? (
                  renderBase10Blocks(col.id, col.value)
                ) : (
                  <span className="text-xs font-bold text-slate-400">—</span>
                )}
              </div>

              <div
                className={`w-11 h-11 rounded-xl bg-white border-2 ${col.border} flex items-center justify-center text-2xl font-black ${col.text}`}
              >
                {!col.active ? "—" : showDigitInCol ? col.value : "?"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 5C-2. MOVABLE-HAND ANALOG CLOCK
// ==========================================
function AnalogClock({
  hour,
  minute,
  interactive = false,
  minuteSnap = 5,
  showMinuteLabels = false,
  highlightHand = null, // "hour" | "minute" | null
  ghostTarget = null, // { hour, minute } for hints
  onChange = null,
  sizeClass = "w-64 h-64 sm:w-72 sm:h-72",
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // "hour" | "minute" | null
  const lastMinuteRef = useRef(minute);

  useEffect(() => {
    lastMinuteRef.current = minute;
  }, [minute]);

  const getAngleFromPointer = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  };

  const updateFromPointer = (hand, clientX, clientY) => {
    if (!interactive || !onChange || !svgRef.current) return;
    const deg = getAngleFromPointer(clientX, clientY);

    if (hand === "hour") {
      const snappedH = Math.round(deg / 30) % 12;
      const nextHour = snappedH === 0 ? 12 : snappedH;
      if (nextHour !== hour) {
        onChange(nextHour, minute);
      }
    } else if (hand === "minute") {
      const rawMin = (deg / 360) * 60;
      const snappedM = (Math.round(rawMin / minuteSnap) * minuteSnap) % 60;
      const prevM = lastMinuteRef.current;

      // Geared hour hand: roll hour forward/backward when crossing 12
      let nextHour = hour;
      if (prevM >= 45 && snappedM <= 15) {
        nextHour = (hour % 12) + 1;
      } else if (prevM <= 15 && snappedM >= 45) {
        nextHour = ((hour - 2 + 12) % 12) + 1;
      }

      if (snappedM !== prevM || nextHour !== hour) {
        lastMinuteRef.current = snappedM;
        onChange(nextHour, snappedM);
      }
    }
  };

  const handlePointerDown = (hand) => (e) => {
    if (!interactive) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(hand);
    sound.playPop();
    updateFromPointer(hand, e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    updateFromPointer(dragging, e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(null);
  };

  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const ghostHourAngle = ghostTarget
    ? ((ghostTarget.hour % 12) + ghostTarget.minute / 60) * 30
    : null;
  const ghostMinuteAngle = ghostTarget ? ghostTarget.minute * 6 : null;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`${sizeClass} select-none touch-none drop-shadow-md`}
    >
      {/* Outer Rim */}
      <circle
        cx="150"
        cy="150"
        r="142"
        fill="#ffffff"
        stroke="#6366f1"
        strokeWidth="10"
      />
      <circle
        cx="150"
        cy="150"
        r="134"
        fill="#f8fafc"
        stroke="#e0e7ff"
        strokeWidth="3"
      />

      {/* 60 Minute Tick Marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const isHourMark = i % 5 === 0;
        const rad = ((i * 6 - 90) * Math.PI) / 180;
        const r1 = isHourMark ? 118 : 124;
        const r2 = 131;
        return (
          <line
            key={i}
            x1={150 + r1 * Math.cos(rad)}
            y1={150 + r1 * Math.sin(rad)}
            x2={150 + r2 * Math.cos(rad)}
            y2={150 + r2 * Math.sin(rad)}
            stroke={isHourMark ? "#334155" : "#cbd5e1"}
            strokeWidth={isHourMark ? "3.5" : "1.5"}
            strokeLinecap="round"
          />
        );
      })}

      {/* Hour Numbers (1-12) & Optional 5-Minute Labels */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const num = idx + 1;
        const rad = ((num * 30 - 90) * Math.PI) / 180;
        const hx = 150 + 98 * Math.cos(rad);
        const hy = 150 + 98 * Math.sin(rad);
        const mx = 150 + 123 * Math.cos(rad);
        const my = 150 + 123 * Math.sin(rad);
        const minLabel = num === 12 ? "00" : String(num * 5).padStart(2, "0");

        return (
          <g key={num}>
            <text
              x={hx}
              y={hy + 8}
              textAnchor="middle"
              className="font-black text-[22px] fill-indigo-950"
            >
              {num}
            </text>
            {showMinuteLabels && (
              <text
                x={mx}
                y={my + 4}
                textAnchor="middle"
                className="font-extrabold text-[10px] fill-sky-600"
              >
                :{minLabel}
              </text>
            )}
          </g>
        );
      })}

      {/* Ghost Hint Hands */}
      {ghostTarget && (
        <g opacity="0.35">
          <line
            x1="150"
            y1="150"
            x2="150"
            y2="82"
            stroke="#e11d48"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="6,6"
            transform={`rotate(${ghostHourAngle} 150 150)`}
          />
          <line
            x1="150"
            y1="150"
            x2="150"
            y2="46"
            stroke="#0284c7"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="6,6"
            transform={`rotate(${ghostMinuteAngle} 150 150)`}
          />
        </g>
      )}

      {/* Hour Hand (Short, Red) */}
      <g
        transform={`rotate(${hourAngle} 150 150)`}
        onPointerDown={handlePointerDown("hour")}
        className={interactive ? "cursor-grab active:cursor-grabbing" : ""}
      >
        <line
          x1="150"
          y1="150"
          x2="150"
          y2="82"
          stroke={highlightHand === "hour" ? "#f43f5e" : "#e11d48"}
          strokeWidth={highlightHand === "hour" ? "13" : "10"}
          strokeLinecap="round"
        />
        {interactive && (
          <>
            {/* Generous touch target */}
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="78"
              stroke="transparent"
              strokeWidth="32"
            />
            <circle
              cx="150"
              cy="82"
              r={dragging === "hour" ? "11" : "8"}
              fill="#e11d48"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </>
        )}
      </g>

      {/* Minute Hand (Long, Blue) */}
      <g
        transform={`rotate(${minuteAngle} 150 150)`}
        onPointerDown={handlePointerDown("minute")}
        className={interactive ? "cursor-grab active:cursor-grabbing" : ""}
      >
        <line
          x1="150"
          y1="150"
          x2="150"
          y2="46"
          stroke={highlightHand === "minute" ? "#38bdf8" : "#0284c7"}
          strokeWidth={highlightHand === "minute" ? "10" : "7"}
          strokeLinecap="round"
        />
        {interactive && (
          <>
            {/* Generous touch target */}
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="42"
              stroke="transparent"
              strokeWidth="32"
            />
            <circle
              cx="150"
              cy="46"
              r={dragging === "minute" ? "11" : "8"}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </>
        )}
      </g>

      {/* Center Pin */}
      <circle
        cx="150"
        cy="150"
        r="9"
        fill="#312e81"
        stroke="#ffffff"
        strokeWidth="3"
      />
    </svg>
  );
}

function InteractiveClockBoard({
  question,
  userTime,
  onUserTimeChange,
  animStepIndex,
  showHintPreview = false,
  isAnsweredCorrectly = false,
}) {
  const { clock, steps = [] } = question;
  if (!clock) return null;

  const isSetMode = clock.qMode === "set_clock";
  const activeStep =
    animStepIndex >= 0
      ? steps[Math.min(animStepIndex, steps.length - 1)]
      : null;

  const displayHour = activeStep
    ? activeStep.hour
    : isSetMode
      ? userTime.hour
      : clock.hour;
  const displayMinute = activeStep
    ? activeStep.minute
    : isSetMode
      ? userTime.minute
      : clock.minute;

  return (
    <div className="w-full bg-gradient-to-b from-rose-50 via-white to-sky-50 rounded-3xl p-4 sm:p-5 border-4 border-rose-300 shadow-inner select-none space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="text-indigo-950 font-black text-base sm:text-xl">
          🕐 {question.promptText}
        </div>
        {activeStep ? (
          <div className="bg-white border-2 border-indigo-400 text-indigo-900 px-4 py-1 rounded-full font-black text-sm shadow-sm animate-bounce">
            ✨ {activeStep.label}
          </div>
        ) : showHintPreview ? (
          <div className="bg-amber-100 border-2 border-amber-400 text-amber-900 px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
            💡 Short Red = Hour · Long Blue = Minutes
          </div>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <AnalogClock
          hour={displayHour}
          minute={displayMinute}
          interactive={isSetMode && !isAnsweredCorrectly && animStepIndex < 0}
          minuteSnap={clock.minuteSnap}
          showMinuteLabels={
            showHintPreview ||
            question.rule.clockMode === "five" ||
            animStepIndex >= 0
          }
          highlightHand={activeStep?.phase || null}
          ghostTarget={
            isSetMode && showHintPreview && !isAnsweredCorrectly
              ? { hour: clock.hour, minute: clock.minute }
              : null
          }
          onChange={onUserTimeChange}
        />

        <div className="flex flex-col items-center gap-3">
          {isSetMode ? (
            <>
              <div className="bg-white border-4 border-indigo-300 rounded-2xl px-6 py-3 text-center shadow-sm">
                <div className="text-xs font-black uppercase text-slate-500">
                  Target Time
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-wider">
                  <span className="text-rose-600">{clock.hour}</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-sky-600">
                    {String(clock.minute).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                Your clock:{" "}
                <span className="font-black text-indigo-950">
                  {formatClockTime(userTime.hour, userTime.minute)}
                </span>
              </div>
            </>
          ) : (
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 text-center space-y-1.5 max-w-[200px]">
              <div className="flex items-center justify-center gap-2 text-sm font-black text-rose-600">
                <span className="w-4 h-1.5 bg-rose-600 rounded-full inline-block" />
                Short = Hour
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-black text-sky-600">
                <span className="w-6 h-1.5 bg-sky-600 rounded-full inline-block" />
                Long = Minutes
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5D. INTERACTIVE LESSON VIEW (ALL TOPICS)
// ==========================================
function InteractiveLessonView({
  rule,
  mascotEmoji = "🐸",
  onStartPractice,
  onStartQuiz,
  onBackHome,
}) {
  const [step, setStep] = useState(0);
  const totalSteps = 3;
  const lessonTimersRef = useRef([]);
  const countRunIdRef = useRef(0);
  const lessonRunIdRef = useRef(0);

  const clearLessonTimers = () => {
    lessonRunIdRef.current += 1;
    lessonTimersRef.current.forEach((t) => clearTimeout(t));
    lessonTimersRef.current = [];
    sound.stop();
  };

  const waitLessonDelay = (ms) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      lessonTimersRef.current.push(t);
    });

  const handleAutoCountCoins = async () => {
    clearLessonTimers();
    const runId = lessonRunIdRef.current;
    setTappedCoinIndices([]);

    let running = 0;
    for (let idx = 0; idx < sandboxCoins.length; idx++) {
      if (lessonRunIdRef.current !== runId) return;

      const type = sandboxCoins[idx];
      running += COIN_SPECS[type].value;
      setTappedCoinIndices((prev) => [...prev, idx]);
      sound.playHop(COIN_SPECS[type].value >= 10);

      await sound.speak(`${running} cents`);
      if (lessonRunIdRef.current !== runId) return;

      await waitLessonDelay(sound.muted ? 700 : 250);
    }
  };

  const handlePlayNumberLineDemo = async (qOverride = null) => {
    const q = qOverride || demoQuestion;
    if (!q) return;

    clearLessonTimers();
    const runId = lessonRunIdRef.current;
    setDemoAnimStep(-1);

    await waitLessonDelay(150);
    if (lessonRunIdRef.current !== runId) return;

    for (let idx = 0; idx < q.steps.length; idx++) {
      if (lessonRunIdRef.current !== runId) return;

      const s = q.steps[idx];
      setDemoAnimStep(idx);
      sound.playHop(Math.abs(s.to - s.from) >= 2);

      if (s.voice) {
        await sound.speak(s.voice);
      }
      if (lessonRunIdRef.current !== runId) return;

      await waitLessonDelay(sound.muted ? 900 : 250);
    }
  };


  // Coin Sandbox State (Step 1)
  const sandboxCoins = useMemo(() => {
    if (rule.category !== "COINS") return [];
    if (rule.coinMode === "penny")
      return ["penny", "penny", "penny", "penny", "penny"];
    if (rule.coinMode === "nickel")
      return ["nickel", "nickel", "nickel", "nickel"];
    if (rule.coinMode === "dime")
      return ["dime", "dime", "dime", "dime", "dime"];
    if (rule.coinMode === "quarter")
      return ["quarter", "quarter", "quarter", "quarter"];
    return ["quarter", "dime", "nickel", "penny", "penny"];
  }, [rule]);

  const [tappedCoinIndices, setTappedCoinIndices] = useState([]);

  // Place Value Number Builder State (Step 1)
  const [builderH, setBuilderH] = useState(0);
  const [builderT, setBuilderT] = useState(0);
  const [builderO, setBuilderO] = useState(5);
  const [sandboxHour, setSandboxHour] = useState(3);
  const [sandboxMinute, setSandboxMinute] = useState(0);

  // Number Line Sandbox State (Addition, Subtraction, Skip & Sliding Counts)
  const [demoQuestion, setDemoQuestion] = useState(() =>
    !rule.category ? generateMathQuestion(rule.id) : null,
  );
  const [demoAnimStep, setDemoAnimStep] = useState(-1);

  const workedExamples = useMemo(() => {
    if (rule.category) return [];
    const list = [];
    const used = [];
    for (let i = 0; i < 3; i++) {
      const q = generateMathQuestion(rule.id, used);
      used.push(q.key);
      list.push(q);
    }
    return list;
  }, [rule]);

  useEffect(() => {
    clearLessonTimers();
    setStep(0);
    setTappedCoinIndices([]);
    setDemoAnimStep(-1);

    if (rule.category === "CLOCK") {
      setSandboxHour(3);
      setSandboxMinute(
        rule.clockMode === "half"
          ? 30
          : rule.clockMode === "quarter"
            ? 15
            : 0,
      );
    }

    if (!rule.category) {
      setDemoQuestion(generateMathQuestion(rule.id));
    } else {
      setDemoQuestion(null);
    }

    if (rule.pvMode === "1digit") {
      setBuilderH(0);
      setBuilderT(0);
      setBuilderO(6);
    } else if (rule.pvMode === "2digit") {
      setBuilderH(0);
      setBuilderT(3);
      setBuilderO(4);
    } else if (rule.pvMode === "3digit") {
      setBuilderH(2);
      setBuilderT(4);
      setBuilderO(5);
    } else {
      setBuilderH(1);
      setBuilderT(2);
      setBuilderO(5);
    }
    return () => clearLessonTimers();
  }, [rule]);

  const handleTapSandboxCoin = (idx) => {
    if (tappedCoinIndices.includes(idx)) return;
    const nextTapped = [...tappedCoinIndices, idx];
    setTappedCoinIndices(nextTapped);
    const newTotal = nextTapped.reduce(
      (sum, coinIdx) => sum + COIN_SPECS[sandboxCoins[coinIdx]].value,
      0,
    );
    sound.playHop(COIN_SPECS[sandboxCoins[idx]].value >= 10);
    sound.speak(`${newTotal} cents`);
  };

  const builderNumber = builderH * 100 + builderT * 10 + builderO;

  const speakBuilderNumber = (h, t, o) => {
    const val = h * 100 + t * 10 + o;
    const parts = [];
    if (h > 0 || rule.pvMode === "3digit")
      parts.push(`${h} ${h === 1 ? "hundred" : "hundreds"}`);
    if (t > 0 || h > 0 || rule.pvMode === "2digit" || rule.pvMode === "3digit")
      parts.push(`${t} ${t === 1 ? "ten" : "tens"}`);
    parts.push(`${o} ${o === 1 ? "one" : "ones"}`);
    sound.speak(`${val}! That is ${parts.join(", ")}!`);
  };

  // --- COINS LESSON ---
  const renderCoinLessonBody = () => {
    if (step === 0) {
      const coinsToIntroduce =
        rule.coinMode === "mixed"
          ? ["quarter", "dime", "nickel", "penny"]
          : [rule.coinMode];

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 1: Meet the{" "}
              {rule.coinMode === "mixed"
                ? "Coins"
                : COIN_SPECS[rule.coinMode].name}
            </h3>
            <button
              onClick={() => sound.speak(rule.voiceRule)}
              className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-400 px-3 py-1.5 rounded-xl font-black text-sm"
            >
              <Volume2 className="w-4 h-4" /> Read Rule
            </button>
          </div>

          <p className="text-lg font-bold text-slate-700 bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl">
            {rule.voiceRule}
          </p>

          <div
            className={`grid gap-4 ${
              coinsToIntroduce.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {coinsToIntroduce.map((coinType) => {
              const spec = COIN_SPECS[coinType];
              return (
                <div
                  key={coinType}
                  onClick={() => {
                    sound.playPop();
                    sound.speak(`${spec.name}. ${spec.tip}`);
                  }}
                  className="bg-white border-4 border-amber-200 hover:border-amber-400 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <USCoin type={coinType} className="mb-3" />
                  <div className="font-black text-xl text-indigo-950">
                    {spec.name} = {spec.value}¢
                  </div>
                  <p className="text-sm font-bold text-slate-600 mt-1">
                    {spec.tip}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 1) {
      const runningTotal = tappedCoinIndices.reduce(
        (sum, idx) => sum + COIN_SPECS[sandboxCoins[idx]].value,
        0,
      );

      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 2: Tap Each Coin to Count!
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleAutoCountCoins}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-black text-sm"
              >
                <Play className="w-4 h-4" /> Count For Me
              </button>
              <button
                onClick={() => {
                  clearLessonTimers();
                  sound.playPop();
                  setTappedCoinIndices([]);
                }}
                className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-amber-50 to-emerald-50 border-4 border-amber-300 rounded-3xl p-5 text-center space-y-5">
            <div className="inline-block bg-white border-4 border-emerald-400 px-6 py-2 rounded-2xl shadow-sm">
              <span className="text-sm font-bold text-slate-500 block">
                Total So Far
              </span>
              <span className="text-4xl font-black text-emerald-700">
                {runningTotal}¢
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-end gap-4 sm:gap-6 py-2">
              {sandboxCoins.map((type, idx) => {
                const spec = COIN_SPECS[type];
                const tapPos = tappedCoinIndices.indexOf(idx);
                const isTapped = tapPos !== -1;
                const partialSum = isTapped
                  ? tappedCoinIndices
                      .slice(0, tapPos + 1)
                      .reduce(
                        (s, cIdx) => s + COIN_SPECS[sandboxCoins[cIdx]].value,
                        0,
                      )
                  : null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTapSandboxCoin(idx)}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group"
                  >
                    <div
                      className={`min-h-[26px] px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-black transition-all ${
                        isTapped
                          ? "bg-emerald-500 text-white shadow"
                          : "bg-amber-200 text-amber-900 group-hover:scale-105"
                      }`}
                    >
                      {isTapped ? `${partialSum}¢` : `Tap +${spec.value}¢`}
                    </div>
                    <USCoin
                      type={type}
                      className={`transition-transform ${
                        isTapped
                          ? "ring-4 ring-emerald-400 scale-105 opacity-95"
                          : "hover:scale-110 active:scale-95"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5 text-center py-2">
        <div className="text-5xl">🪙✨</div>
        <h3 className="text-2xl sm:text-3xl font-black text-indigo-950">
          You're Ready for {rule.label}!
        </h3>
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 max-w-xl mx-auto text-left space-y-2 font-bold text-amber-950">
          <div>✅ Remember: {rule.voiceRule}</div>
          <div>
            ✅{" "}
            {rule.coinMode === "mixed"
              ? "Start with Quarters (25¢), then Dimes (10¢), Nickels (5¢), and Pennies (1¢)."
              : `Each ${COIN_SPECS[rule.coinMode].name} adds ${COIN_SPECS[rule.coinMode].value}¢ to your total.`}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onStartPractice(rule.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-emerald-700 active:scale-95 transition-transform"
          >
            Start Practice →
          </button>
          <button
            onClick={() => onStartQuiz(rule.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-indigo-800 active:scale-95 transition-transform"
          >
            Take 10-Question Quiz 🏆
          </button>
        </div>
      </div>
    );
  };

  // --- PLACE VALUE LESSON ---
  const renderPlaceValueLessonBody = () => {
    const showH = rule.pvMode === "3digit" || rule.pvMode === "mixed";
    const showT =
      rule.pvMode === "2digit" ||
      rule.pvMode === "3digit" ||
      rule.pvMode === "mixed";

    if (step === 0) {
      const placeCards = [];
      if (showH) {
        placeCards.push({
          id: "hundreds",
          title: "Hundreds Place",
          desc: "Left digit in a 3-digit number. Each flat = 100!",
          sampleCount: 1,
          bg: "bg-purple-50 border-purple-300 text-purple-900",
          badge: "bg-purple-600 text-white",
          voice:
            "The Hundreds place is on the left of a three-digit number. One hundred flat equals one hundred ones!",
        });
      }
      if (showT) {
        placeCards.push({
          id: "tens",
          title: "Tens Place",
          desc: "Each tall rod = 10 ones!",
          sampleCount: 1,
          bg: "bg-sky-50 border-sky-300 text-sky-900",
          badge: "bg-sky-600 text-white",
          voice:
            "The Tens place is next to the Ones place. Each ten rod is a group of ten ones!",
        });
      }
      placeCards.push({
        id: "ones",
        title: "Ones Place",
        desc: "Always the rightmost digit. Each cube = 1!",
        sampleCount: 1,
        bg: "bg-emerald-50 border-emerald-300 text-emerald-900",
        badge: "bg-emerald-600 text-white",
        voice:
          "The Ones place is always on the right. Each little cube equals one!",
      });

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 1: Meet the Digit Positions
            </h3>
            <button
              onClick={() => sound.speak(rule.voiceRule)}
              className="flex items-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-2 border-indigo-400 px-3 py-1.5 rounded-xl font-black text-sm"
            >
              <Volume2 className="w-4 h-4" /> Read Rule
            </button>
          </div>

          <p className="text-lg font-bold text-slate-700 bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl">
            {rule.voiceRule}
          </p>

          <div
            className={`grid gap-4 ${
              placeCards.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : placeCards.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {placeCards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  sound.playPop();
                  sound.speak(card.voice);
                }}
                className={`${card.bg} border-4 rounded-3xl p-5 flex flex-col items-center text-center cursor-pointer shadow-sm transition-transform active:scale-95`}
              >
                <span
                  className={`${card.badge} px-3 py-1 rounded-full font-black text-sm uppercase tracking-wider mb-3`}
                >
                  {card.title}
                </span>
                <div className="h-16 flex items-center justify-center mb-3">
                  {renderBase10Blocks(card.id, card.sampleCount)}
                </div>
                <p className="font-bold text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step === 1) {
      const expandedParts = [];
      if (showH && builderH > 0) expandedParts.push(`${builderH * 100}`);
      if (showT && (builderT > 0 || (showH && builderH > 0)))
        expandedParts.push(`${builderT * 10}`);
      expandedParts.push(`${builderO}`);

      const minH = rule.pvMode === "3digit" ? 1 : 0;
      const minT = rule.pvMode === "2digit" ? 1 : 0;
      const minO = rule.pvMode === "1digit" ? 1 : 0;

      const adjustDigit = (which, delta) => {
        sound.playPop();
        if (which === "H") {
          setBuilderH(Math.max(minH, Math.min(9, builderH + delta)));
        } else if (which === "T") {
          setBuilderT(Math.max(minT, Math.min(9, builderT + delta)));
        } else {
          setBuilderO(Math.max(minO, Math.min(9, builderO + delta)));
        }
      };

      const builderCols = [];
      if (showH) {
        builderCols.push({
          key: "H",
          id: "hundreds",
          title: "Hundreds",
          val: builderH,
          min: minH,
          bg: "bg-purple-50 border-purple-300",
          badge: "bg-purple-600 text-white",
          text: "text-purple-900",
        });
      }
      if (showT) {
        builderCols.push({
          key: "T",
          id: "tens",
          title: "Tens",
          val: builderT,
          min: minT,
          bg: "bg-sky-50 border-sky-300",
          badge: "bg-sky-600 text-white",
          text: "text-sky-900",
        });
      }
      builderCols.push({
        key: "O",
        id: "ones",
        title: "Ones",
        val: builderO,
        min: minO,
        bg: "bg-emerald-50 border-emerald-300",
        badge: "bg-emerald-600 text-white",
        text: "text-emerald-900",
      });

      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 2: Build a Number!
            </h3>
            <button
              onClick={() => speakBuilderNumber(builderH, builderT, builderO)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl font-black text-sm"
            >
              <Volume2 className="w-4 h-4" /> Read My Number
            </button>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center justify-center gap-3 text-center">
            <span className="text-4xl sm:text-5xl font-black text-indigo-950">
              {builderNumber}
            </span>
            {expandedParts.length > 1 && (
              <span className="text-lg sm:text-xl font-black text-indigo-700 bg-white px-3 py-1 rounded-xl border-2 border-indigo-200">
                = {expandedParts.join(" + ")}
              </span>
            )}
          </div>

          <div
            className={`grid gap-3 ${
              builderCols.length === 1
                ? "grid-cols-1 max-w-xs mx-auto"
                : builderCols.length === 2
                  ? "grid-cols-2 max-w-lg mx-auto"
                  : "grid-cols-3"
            }`}
          >
            {builderCols.map((col) => (
              <div
                key={col.id}
                className={`${col.bg} border-2 rounded-2xl p-3 flex flex-col items-center justify-between min-h-[185px]`}
              >
                <span
                  className={`${col.badge} px-3 py-0.5 rounded-full text-xs sm:text-sm font-black uppercase`}
                >
                  {col.title}
                </span>

                <div className="my-2 flex-1 flex items-center justify-center">
                  {renderBase10Blocks(col.id, col.val)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={col.val <= col.min}
                    onClick={() => adjustDigit(col.key, -1)}
                    className="w-9 h-9 rounded-xl bg-white border-2 border-slate-300 flex items-center justify-center font-black text-slate-700 disabled:opacity-40 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    className={`text-2xl font-black w-8 text-center ${col.text}`}
                  >
                    {col.val}
                  </span>
                  <button
                    type="button"
                    disabled={col.val >= 9}
                    onClick={() => adjustDigit(col.key, 1)}
                    className="w-9 h-9 rounded-xl bg-white border-2 border-slate-300 flex items-center justify-center font-black text-slate-700 disabled:opacity-40 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const comparisonExamples =
      rule.pvMode === "1digit"
        ? [
            { num: "7", desc: "7 Ones = 7 (1-digit number)" },
            { num: "9", desc: "9 Ones = 9 (biggest 1-digit number!)" },
          ]
        : rule.pvMode === "2digit"
          ? [
              { num: "25", desc: "2 Tens (20) + 5 Ones (5)" },
              { num: "52", desc: "5 Tens (50) + 2 Ones (2)" },
            ]
          : rule.pvMode === "3digit"
            ? [
                {
                  num: "135",
                  desc: "1 Hundred (100) + 3 Tens (30) + 5 Ones (5)",
                },
                {
                  num: "531",
                  desc: "5 Hundreds (500) + 3 Tens (30) + 1 One (1)",
                },
              ]
            : [
                { num: "5", desc: "5 in the Ones place = 5" },
                { num: "50", desc: "5 in the Tens place = 50" },
                { num: "500", desc: "5 in the Hundreds place = 500" },
              ];

    return (
      <div className="space-y-5 text-center py-2">
        <h3 className="text-2xl sm:text-3xl font-black text-indigo-950">
          Step 3: Position Changes Value!
        </h3>
        <div
          className={`grid gap-3 max-w-2xl mx-auto ${
            comparisonExamples.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {comparisonExamples.map((ex) => (
            <div
              key={ex.num}
              onClick={() => {
                sound.playPop();
                sound.speak(`${ex.num}. ${ex.desc}`);
              }}
              className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-4 cursor-pointer hover:bg-indigo-100"
            >
              <div className="text-4xl font-black text-indigo-950 mb-1">
                {ex.num}
              </div>
              <div className="text-sm font-bold text-indigo-800">{ex.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onStartPractice(rule.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-emerald-700 active:scale-95 transition-transform"
          >
            Start Practice →
          </button>
          <button
            onClick={() => onStartQuiz(rule.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-indigo-800 active:scale-95 transition-transform"
          >
            Take 10-Question Quiz 🏆
          </button>
        </div>
      </div>
    );
  };

  // --- CLOCK LESSON ---
  const renderClockLessonBody = () => {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 1: Meet the Clock Hands!
            </h3>
            <button
              onClick={() => sound.speak(rule.voiceRule)}
              className="flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-rose-400 px-3 py-1.5 rounded-xl font-black text-sm"
            >
              <Volume2 className="w-4 h-4" /> Read Rule
            </button>
          </div>

          <p className="text-lg font-bold text-slate-700 bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl">
            {rule.voiceRule}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div
              onClick={() => {
                sound.playPop();
                sound.speak(
                  "The short red hand is the Hour hand! It tells us what hour it is.",
                );
              }}
              className="bg-rose-50 border-4 border-rose-300 rounded-3xl p-5 text-center cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-16 h-3 bg-rose-600 rounded-full mx-auto mb-3" />
              <div className="font-black text-xl text-rose-900">
                Short Red Hand = Hour
              </div>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Points to the big hour number (1 to 12).
              </p>
            </div>

            <div
              onClick={() => {
                sound.playPop();
                sound.speak(
                  "The long blue hand is the Minute hand! Twelve means o'clock, and six means thirty minutes!",
                );
              }}
              className="bg-sky-50 border-4 border-sky-300 rounded-3xl p-5 text-center cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-24 h-2.5 bg-sky-600 rounded-full mx-auto mb-3" />
              <div className="font-black text-xl text-sky-900">
                Long Blue Hand = Minutes
              </div>
              <p className="text-sm font-bold text-slate-600 mt-1">
                12 = :00 · 3 = :15 · 6 = :30 · 9 = :45
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (step === 1) {
      const adjustMinutes = (delta) => {
        sound.playPop();
        const total = (sandboxHour % 12) * 60 + sandboxMinute + delta;
        const normalized = ((total % 720) + 720) % 720;
        const nextH = Math.floor(normalized / 60) || 12;
        const nextM = normalized % 60;
        setSandboxHour(nextH);
        setSandboxMinute(nextM);
      };

      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 2: Drag the Hands!
            </h3>
            <button
              onClick={() =>
                sound.speak(
                  `The clock shows ${speakClockTime(sandboxHour, sandboxMinute)}!`,
                )
              }
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl font-black text-sm"
            >
              <Volume2 className="w-4 h-4" /> Read Time
            </button>
          </div>

          <div className="bg-gradient-to-b from-rose-50 to-sky-50 border-4 border-indigo-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
            <AnalogClock
              hour={sandboxHour}
              minute={sandboxMinute}
              interactive={true}
              minuteSnap={rule.minuteSnap || 5}
              showMinuteLabels={true}
              onChange={(h, m) => {
                setSandboxHour(h);
                setSandboxMinute(m);
              }}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="bg-white border-4 border-indigo-300 rounded-2xl px-6 py-3 shadow-sm">
                <div className="text-5xl font-black tracking-wider">
                  <span className="text-rose-600">{sandboxHour}</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-sky-600">
                    {String(sandboxMinute).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => adjustMinutes(60)}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-rose-300 px-3 py-1.5 rounded-xl font-black text-sm"
                >
                  +1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => adjustMinutes(rule.minuteSnap || 5)}
                  className="bg-sky-100 hover:bg-sky-200 text-sky-900 border-2 border-sky-300 px-3 py-1.5 rounded-xl font-black text-sm"
                >
                  +{rule.minuteSnap === 60 ? "1 Hr" : `${rule.minuteSnap} Min`}
                </button>
              </div>
              <p className="text-xs font-bold text-slate-500 text-center max-w-[180px]">
                Grab the red or blue dot on the clock hands to spin them!
              </p>
            </div>
          </div>
        </div>
      );
    }

    const sampleTimes =
      rule.clockMode === "hour"
        ? [
            { h: 3, m: 0 },
            { h: 7, m: 0 },
            { h: 12, m: 0 },
          ]
        : rule.clockMode === "half"
          ? [
              { h: 2, m: 30 },
              { h: 6, m: 30 },
              { h: 10, m: 30 },
            ]
          : rule.clockMode === "quarter"
            ? [
                { h: 4, m: 15 },
                { h: 8, m: 45 },
                { h: 11, m: 15 },
              ]
            : [
                { h: 1, m: 20 },
                { h: 5, m: 35 },
                { h: 9, m: 50 },
              ];

    return (
      <div className="space-y-5 text-center py-2">
        <h3 className="text-2xl sm:text-3xl font-black text-indigo-950">
          Step 3: Tap a Clock to Hear the Time!
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {sampleTimes.map(({ h, m }) => {
            const formatted = formatClockTime(h, m);
            return (
              <button
                key={formatted}
                type="button"
                onClick={() => {
                  sound.playPop();
                  sound.speak(speakClockTime(h, m));
                }}
                className="bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <AnalogClock
                  hour={h}
                  minute={m}
                  sizeClass="w-28 h-28"
                  showMinuteLabels={rule.clockMode === "five"}
                />
                <span className="text-2xl font-black text-indigo-950">
                  {formatted}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onStartPractice(rule.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-emerald-700 active:scale-95 transition-transform"
          >
            Start Practice →
          </button>
          <button
            onClick={() => onStartQuiz(rule.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-indigo-800 active:scale-95 transition-transform"
          >
            Take 10-Question Quiz 🏆
          </button>
        </div>
      </div>
    );
  };

  // --- NUMBER LINE LESSON (SKIP/SLIDING, ADDITION, SUBTRACTION) ---
  const renderNumberLineLessonBody = () => {
    const isSkipOrSlide = Boolean(rule.max);

    if (step === 0) {
      let patternNumbers = [];
      let patternTip = "";
      if (rule.id === "COUNT5") {
        patternNumbers = [5, 10, 15, 20, 25, 30];
        patternTip = "Notice the ones digit repeats: 5, 0, 5, 0!";
      } else if (rule.id === "COUNT10") {
        patternNumbers = [10, 20, 30, 40, 50, 60];
        patternTip = "The tens digit goes up by 1 each hop, and the ones digit stays 0!";
      } else if (rule.id === "COUNT10_BACK") {
        patternNumbers = [60, 50, 40, 30, 20, 10];
        patternTip = "The tens digit goes down by 1 each hop!";
      } else if (rule.id === "SLIDE10_FWD") {
        patternNumbers = [14, 24, 34, 44, 54];
        patternTip = "The ones digit (4) stays the same — only the tens digit goes up by 1!";
      } else if (rule.id === "SLIDE10_BACK") {
        patternNumbers = [57, 47, 37, 27, 17];
        patternTip = "The ones digit (7) stays the same — only the tens digit goes down by 1!";
      }

      const sampleQ = demoQuestion || workedExamples[0];

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 1: Learn the Trick for {rule.label}
            </h3>
            <button
              onClick={() => sound.speak(rule.voiceRule)}
              className="flex items-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-2 border-indigo-400 px-3 py-1.5 rounded-xl font-black text-sm"
            >
              <Volume2 className="w-4 h-4" /> Read Rule
            </button>
          </div>

          <div
            className={`${rule.bgLight} border-2 ${rule.border} p-4 rounded-2xl space-y-1`}
          >
            <div className={`font-black text-xl ${rule.text}`}>
              {rule.title}
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-700">
              {rule.voiceRule}
            </p>
          </div>

          {isSkipOrSlide ? (
            <div className="space-y-3">
              <div className="text-sm font-black uppercase tracking-wider text-slate-500 text-center">
                Tap the Pattern to Hear It!
              </div>
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                {patternNumbers.map((num, idx) => {
                  const str = String(num);
                  const tensPart = str.length > 1 ? str.slice(0, -1) : "";
                  const onesPart = str.slice(-1);
                  return (
                    <React.Fragment key={num}>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          sound.speak(`${num}`);
                        }}
                        className="bg-white border-4 border-indigo-300 hover:border-indigo-500 rounded-2xl px-4 py-2.5 text-2xl sm:text-3xl font-black shadow-sm active:scale-95 transition-transform"
                      >
                        <span className="text-indigo-950">{tensPart}</span>
                        <span
                          className={
                            rule.sliding ? "text-rose-600 underline" : "text-indigo-950"
                          }
                        >
                          {onesPart}
                        </span>
                      </button>
                      {idx < patternNumbers.length - 1 && (
                        <span className="font-black text-indigo-400 text-xl">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="text-center font-bold text-sm text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-xl p-2.5">
                💡 {patternTip}
              </p>
            </div>
          ) : (
            sampleQ && (
              <div className="space-y-3">
                <div className="text-sm font-black uppercase tracking-wider text-slate-500 text-center">
                  How the Hops Work (Example: {sampleQ.startNum} {rule.op}
                  {rule.val} = {sampleQ.answer})
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {sampleQ.steps.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sound.playHop();
                        sound.speak(s.voice);
                      }}
                      className="bg-white border-4 border-indigo-200 hover:border-indigo-400 rounded-2xl p-4 text-center min-w-[170px] shadow-sm active:scale-95 transition-transform"
                    >
                      <div className="text-xs font-black uppercase text-indigo-500 mb-1">
                        Hop {idx + 1}: {s.label}
                      </div>
                      <div className="text-2xl font-black text-indigo-950">
                        {s.from} → {s.to}
                      </div>
                      <div className="text-xs font-bold text-slate-600 mt-1">
                        {s.voice}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      );
    }

    if (step === 1 && demoQuestion) {
      const canChain =
        isSkipOrSlide &&
        !(rule.op === "-" && demoQuestion.answer < rule.val);

      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl font-black text-indigo-950">
              Step 2: Watch the Hops!
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePlayNumberLineDemo()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl font-black text-sm"
              >
                <Play className="w-4 h-4" /> Watch the Hops!
              </button>
              {canChain && (
                <button
                  onClick={() => {
                    clearLessonTimers();
                    const nextQ = generateMathQuestion(
                      rule.id,
                      [demoQuestion.key],
                      demoQuestion.answer,
                    );
                    setDemoQuestion(nextQ);
                    setDemoAnimStep(-1);
                    handlePlayNumberLineDemo(nextQ);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-black text-sm"
                >
                  Chain Next Hop →
                </button>
              )}
              <button
                onClick={() => {
                  clearLessonTimers();
                  sound.playPop();
                  const fresh = generateMathQuestion(rule.id, [
                    demoQuestion.key,
                  ]);
                  setDemoQuestion(fresh);
                  setDemoAnimStep(-1);
                }}
                className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-sm"
              >
                <RefreshCw className="w-4 h-4" /> New Example
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 text-center text-3xl sm:text-4xl font-black text-indigo-950">
            {demoQuestion.startNum}{" "}
            <span
              className={
                rule.op === "+" ? "text-emerald-600" : "text-orange-500"
              }
            >
              {rule.op}
              {rule.val}
            </span>{" "}
            ={" "}
            <span
              className={
                demoAnimStep >= demoQuestion.steps.length - 1
                  ? "text-emerald-600"
                  : "text-indigo-400"
              }
            >
              {demoAnimStep >= demoQuestion.steps.length - 1
                ? demoQuestion.answer
                : "?"}
            </span>
          </div>

          <InteractiveNumberLine
            question={demoQuestion}
            mascotEmoji={mascotEmoji}
            animStepIndex={demoAnimStep}
            showHintPreview={true}
          />
        </div>
      );
    }

    // Step 2: Worked Examples & Ready to Go
    return (
      <div className="space-y-5 text-center py-2">
        <h3 className="text-2xl sm:text-3xl font-black text-indigo-950">
          Step 3: Try Saying These Out Loud!
        </h3>
        <p className="text-sm font-bold text-slate-600">
          Tap any card to hear the equation, then jump into Practice or Quiz!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {workedExamples.map((ex) => (
            <button
              key={ex.key}
              type="button"
              onClick={() => {
                sound.playPop();
                sound.speak(
                  `${ex.startNum} ${rule.op === "+" ? "plus" : "minus"} ${rule.val} equals ${ex.answer}!`,
                );
              }}
              className={`${rule.bgLight} border-2 ${rule.border} rounded-2xl p-4 hover:scale-105 active:scale-95 transition-transform shadow-sm`}
            >
              <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                {ex.startNum}{" "}
                <span
                  className={
                    rule.op === "+" ? "text-emerald-600" : "text-orange-600"
                  }
                >
                  {rule.op}
                  {rule.val}
                </span>{" "}
                = {ex.answer}
              </div>
              <div className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Tap to listen
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onStartPractice(rule.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-emerald-700 active:scale-95 transition-transform"
          >
            Start Practice →
          </button>
          <button
            onClick={() => onStartQuiz(rule.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg px-8 py-3 rounded-2xl border-b-4 border-indigo-800 active:scale-95 transition-transform"
          >
            Take 10-Question Quiz 🏆
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 space-y-4">
      <div
        className={`${rule.bgLight} border-2 ${rule.border} rounded-3xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rule.color} text-white flex items-center justify-center shrink-0`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider opacity-70">
              Interactive Lesson
            </div>
            <h2 className={`font-black text-lg leading-tight ${rule.text}`}>
              {rule.label}: {rule.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartPractice(rule.id)}
            className="bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-300 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm"
          >
            Practice
          </button>
          <button
            onClick={() => onStartQuiz(rule.id)}
            className={`bg-gradient-to-r ${rule.color} text-white px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm`}
          >
            Quiz
          </button>
        </div>
      </div>

      {/* Step Progress Dots */}
      <div className="flex justify-center items-center gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => {
              clearLessonTimers();
              sound.playPop();
              setStep(i);
            }}
            className={`h-3 rounded-full transition-all ${
              step === i ? "w-10 bg-indigo-600" : "w-3 bg-indigo-200"
            }`}
            aria-label={`Lesson step ${i + 1}`}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl border-4 border-indigo-200 p-4 sm:p-6 shadow-md">
        {rule.category === "COINS"
          ? renderCoinLessonBody()
          : rule.category === "PLACE_VALUE"
            ? renderPlaceValueLessonBody()
            : rule.category === "CLOCK"
              ? renderClockLessonBody()
              : renderNumberLineLessonBody()}
      </div>

      {/* Prev / Next Navigation */}
      <div className="flex justify-between items-center gap-3">
        <button
          onClick={() => {
            clearLessonTimers();
            sound.playPop();
            if (step > 0) setStep((s) => s - 1);
            else onBackHome();
          }}
          className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black px-5 py-3 rounded-2xl"
        >
          <ChevronLeft className="w-5 h-5" />
          {step === 0 ? "Back Home" : "Previous"}
        </button>

        {step < totalSteps - 1 ? (
          <button
            onClick={() => {
              clearLessonTimers();
              sound.playPop();
              setStep((s) => s + 1);
            }}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl border-b-4 border-indigo-800"
          >
            Next Step
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => {
              clearLessonTimers();
              sound.playPop();
              setStep(0);
            }}
            className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-black px-5 py-3 rounded-2xl"
          >
            <RefreshCw className="w-4 h-4" /> Replay Lesson
          </button>
        )}
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
  const [activeHomeTab, setActiveHomeTab] = useState("ADD");
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

  // Lesson State
  const [activeLessonRuleKey, setActiveLessonRuleKey] = useState("+1");

  // Practice State
  const [practiceCustomStart, setPracticeCustomStart] = useState("");
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
  const [practiceClockTime, setPracticeClockTime] = useState({
    hour: 12,
    minute: 0,
  });
  const [quizClockTime, setQuizClockTime] = useState({
    hour: 12,
    minute: 0,
  });

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
  const animRunIdRef = useRef(0);

  const clearAnimTimers = () => {
    animRunIdRef.current += 1;
    animTimersRef.current.forEach((t) => clearTimeout(t));
    animTimersRef.current = [];
    sound.stop();
  };

  const waitAnimDelay = (ms) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      animTimersRef.current.push(t);
    });

  // Hydration from PocketBase & Local Storage
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

  useEffect(() => {
    try {
      if (activeStudentId)
        localStorage.setItem(LS_ACTIVE_ID_KEY, activeStudentId);
      else localStorage.removeItem(LS_ACTIVE_ID_KEY);
    } catch (e) {
      console.error("Local storage active ID write error", e);
    }
  }, [activeStudentId]);

  useEffect(() => {
    if (!isLoadingData && activeStudentId && currentView === "PROFILES") {
      const exists = students.some((s) => s.id === activeStudentId);
      if (exists) setCurrentView("HOME");
      else setActiveStudentId(null);
    }
  }, [isLoadingData, students, activeStudentId, currentView]);

  useEffect(() => {
    if (practiceQuestion?.clock) {
      setPracticeClockTime({
        hour: practiceQuestion.clock.startHour,
        minute: practiceQuestion.clock.startMinute,
      });
    }
  }, [practiceQuestion?.key]);

  useEffect(() => {
    const q = quizQuestions[quizCurrentIndex];
    if (q?.clock) {
      setQuizClockTime({
        hour: q.clock.startHour,
        minute: q.clock.startMinute,
      });
    }
  }, [quizCurrentIndex, quizQuestions]);

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

  const updateActiveStudentState = async (updaterFn) => {
    if (!activeStudentId) return;

    const currentStudent = students.find((s) => s.id === activeStudentId);
    if (!currentStudent) return;

    const updates = updaterFn(currentStudent);
    if ("stars" in updates) updates.stars = Number(updates.stars);

    setStudents((prevStudents) =>
      prevStudents.map((s) =>
        s.id === activeStudentId ? { ...s, ...updates } : s,
      ),
    );

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

  // Lesson Mode
  const handleStartLesson = (rk) => {
    clearAnimTimers();
    sound.playPop();
    setActiveLessonRuleKey(rk);
    setCurrentView("LESSON");
    const rule = MATH_RULES[rk];
    if (rule) sound.speak(`Lesson time! ${rule.label}. ${rule.voiceRule}`);
  };

  // Practice Mode
  const loadNewPracticeQuestion = (
    ruleKeyOverride = selectedRuleKey,
    customStart = null,
  ) => {
    clearAnimTimers();
    const nextQ = generateMathQuestion(
      ruleKeyOverride,
      practiceQuestion?.key ? [practiceQuestion.key] : [],
      customStart,
    );
    setPracticeQuestion(nextQ);
    setPracticeCustomStart("");
    setPracticeSelectedAns(null);
    setPracticeIsCorrect(null);
    setPracticeAnimStep(-1);
    setPracticeShowHint(false);
    setPracticeFirstTry(true);
    sound.speak(nextQ.voicePrompt);
  };

  const playStepAnimationSequence = async (q, onComplete) => {
    clearAnimTimers();
    const runId = animRunIdRef.current;
    setPracticeAnimStep(-1);

    await waitAnimDelay(150);
    if (animRunIdRef.current !== runId) return;

    for (let idx = 0; idx < q.steps.length; idx++) {
      if (animRunIdRef.current !== runId) return;

      const step = q.steps[idx];
      setPracticeAnimStep(idx);

      const isBig =
        step.from !== undefined && step.to !== undefined
          ? Math.abs(step.to - step.from) >= 2
          : false;
      sound.playHop(isBig);

      if (step.voice) {
        await sound.speak(step.voice);
      }
      if (animRunIdRef.current !== runId) return;

      const pauseMs = sound.muted
        ? q.rule.category === "COINS"
          ? 700
          : 900
        : 250;
      await waitAnimDelay(pauseMs);
    }

    if (animRunIdRef.current !== runId) return;
    if (onComplete) onComplete();
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
    const usedKeys = [];

    for (let i = 0; i < QUIZ_TOTAL_QUESTIONS; i++) {
      const q = generateMathQuestion(pool[i % pool.length], usedKeys);
      usedKeys.push(q.key);
      generated.push(q);
    }

    generated.sort(() => Math.random() - 0.5);

    setQuizQuestions(generated);
    setQuizCurrentIndex(0);
    setQuizAnswers([]);
    setQuizLockedChoice(null);
    setQuizAnimStep(-1);
    setQuizCompleted(false);
    setQuizActive(true);
    setCurrentView("QUIZ");
    sound.speak(`Quiz time! ${QUIZ_TOTAL_QUESTIONS} questions.`);
  };

  const handleQuizAnswerTap = (chosenNum) => {
    if (quizLockedChoice !== null) return;
    setQuizLockedChoice(chosenNum);
    const currentQ = quizQuestions[quizCurrentIndex];
    const isRight = chosenNum === currentQ.answer;

    if (isRight) sound.playSuccess();
    else sound.playGentleOops();

    const quizStepDelay = currentQ.rule.category === "COINS" ? 350 : 650;
    currentQ.steps.forEach((_, idx) => {
      const t = setTimeout(
        () => {
          setQuizAnimStep(idx);
          sound.playHop();
        },
        idx * quizStepDelay + 100,
      );
      animTimersRef.current.push(t);
    });

    const unit = currentQ.answerUnit || "";
    const newAnswers = [
      ...quizAnswers,
      {
        questionKey: currentQ.key,
        equation:
          currentQ.equationLog ||
          `${currentQ.startNum} ${currentQ.rule.op}${currentQ.rule.val} = ${currentQ.answer}`,
        ruleId: currentQ.rule.id,
        chosen: `${chosenNum}${unit}`,
        correctAnswer: `${currentQ.answer}${unit}`,
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

            const scopeLabel =
              quizRuleScope === "ALL"
                ? "Mixed"
                : MATH_RULES[quizRuleScope]?.label || quizRuleScope;

            const newRecord = {
              id: `qz_${Date.now()}`,
              date: new Date().toLocaleDateString(),
              timestamp: Date.now(),
              scope: scopeLabel,
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
      Math.min(currentQ.steps.length * quizStepDelay + 1100, 3200),
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
          <button
            onClick={() => setCurrentView("STICKERS")}
            className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-xl border-2 border-amber-400"
          >
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="font-black text-amber-900">
              {activeStudent.stars || 0}
            </span>
          </button>
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

  const renderLessonCardGrid = (
    ruleKeys,
    gridClass = "grid-cols-2 md:grid-cols-5",
    includeLessonButton = true,
  ) => (
    <div className={`grid ${gridClass} gap-3`}>
      {ruleKeys.map((rk) => {
        const rule = MATH_RULES[rk];
        return (
          <div
            key={rk}
            className={`${rule.bgLight} border-2 ${rule.border} rounded-2xl p-3 flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`bg-gradient-to-br ${rule.color} text-white font-black text-base px-2 py-1 rounded-lg`}
              >
                {rule.label}
              </span>
            </div>
            <h4 className={`font-black text-sm mt-2 ${rule.text}`}>
              {rule.title}
            </h4>
            <div className="space-y-1.5 mt-3">
              {includeLessonButton && (
                <button
                  onClick={() => handleStartLesson(rk)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Lesson
                </button>
              )}
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    handlePracticeRuleSelect(rk);
                    setCurrentView("PRACTICE");
                  }}
                  className="flex-1 bg-white text-indigo-900 border-2 border-indigo-200 py-1 rounded-lg font-black text-xs active:scale-95 transition-transform"
                >
                  Practice
                </button>
                <button
                  onClick={() => startNewQuiz(rk)}
                  className={`flex-1 bg-gradient-to-r ${rule.color} text-white py-1 rounded-lg font-black text-xs active:scale-95 transition-transform`}
                >
                  Quiz
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHomeView = () => {
    if (!activeStudent) return renderProfilesView();

    const currentTab =
      HOME_TABS.find((t) => t.id === activeHomeTab) || HOME_TABS[0];

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-500 rounded-3xl p-5 text-white shadow-xl flex items-center gap-4">
          <div className="text-5xl">{activeStudent.avatarEmoji}</div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Hi, {activeStudent.name}!
            </h2>
            <p className="font-bold text-indigo-100 text-sm">
              Pick a category tab below for a Lesson, Practice, or Quiz!
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Math Topics"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5"
        >
          {HOME_TABS.map((tab) => {
            const isActive = tab.id === currentTab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  sound.playPop();
                  setActiveHomeTab(tab.id);
                }}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-2 border-b-4 font-black text-sm sm:text-base transition-all active:scale-95 ${
                  isActive ? tab.activeClass : tab.inactiveClass
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Category Panel */}
        <section
          role="tabpanel"
          className={`bg-white rounded-3xl border-2 ${currentTab.panelBorder} shadow-sm overflow-hidden`}
        >
          <div
            className={`${currentTab.panelHeader} border-b-2 px-5 py-3.5 flex items-center gap-3`}
          >
            <span className="text-3xl">{currentTab.icon}</span>
            <div>
              <h3 className="text-xl font-black text-indigo-950 leading-tight">
                {currentTab.title}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {currentTab.subtitle}
              </p>
            </div>
          </div>

          <div className="p-4">
            {currentTab.id === "CHALLENGES" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 flex flex-col justify-between text-white shadow-md border-4 border-indigo-400">
                  <div>
                    <h4 className="font-black text-xl mb-1">Mixed Scope</h4>
                    <p className="font-bold text-sm text-indigo-100">
                      All addition and subtraction rules combined!
                    </p>
                  </div>
                  <button
                    onClick={() => startNewQuiz("ALL")}
                    className="mt-4 bg-white text-indigo-900 border-2 border-indigo-200 py-2 rounded-xl font-black text-sm hover:bg-indigo-50 active:scale-95 transition-transform"
                  >
                    Start Quiz (Up to 300 ⭐)
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 flex flex-col justify-between text-white shadow-md border-4 border-emerald-400">
                  <div>
                    <h4 className="font-black text-xl mb-1">All Addition</h4>
                    <p className="font-bold text-sm text-emerald-100">
                      Every addition rule from +1 to +10!
                    </p>
                  </div>
                  <button
                    onClick={() => startNewQuiz("ADD")}
                    className="mt-4 bg-white text-emerald-900 border-2 border-emerald-200 py-2 rounded-xl font-black text-sm hover:bg-emerald-50 active:scale-95 transition-transform"
                  >
                    Start Quiz (Up to 300 ⭐)
                  </button>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-4 flex flex-col justify-between text-white shadow-md border-4 border-orange-400">
                  <div>
                    <h4 className="font-black text-xl mb-1">All Subtraction</h4>
                    <p className="font-bold text-sm text-orange-100">
                      Every subtraction rule from -1 to -10!
                    </p>
                  </div>
                  <button
                    onClick={() => startNewQuiz("SUB")}
                    className="mt-4 bg-white text-orange-900 border-2 border-orange-200 py-2 rounded-xl font-black text-sm hover:bg-orange-50 active:scale-95 transition-transform"
                  >
                    Start Quiz (Up to 300 ⭐)
                  </button>
                </div>
              </div>
            ) : (
              renderLessonCardGrid(currentTab.rules, currentTab.gridClass, true)
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderPracticeView = () => {
    const { startNum, rule, answer, options, answerUnit = "" } =
      practiceQuestion;
    const isCustomizableRule = Boolean(rule.max);
    const isCoins = rule.category === "COINS";
    const isPlaceValue = rule.category === "PLACE_VALUE";
    const isClock = rule.category === "CLOCK";

    const helpButtonText = isCoins
      ? "Show me how to count!"
      : isClock
        ? "Show me the time!"
        : isPlaceValue
          ? "Show me the place values!"
          : "Show me the hops!";

    return (
      <div className="max-w-4xl mx-auto px-2 py-4 space-y-3">
        <div
          className={`${rule.bgLight} border-2 ${rule.border} rounded-3xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-2`}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartLesson(rule.id)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl font-black text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4" /> Lesson
            </button>
            {!isCoins && !isPlaceValue && !isClock ? (
              <div className="bg-white px-4 py-2 rounded-2xl border-2 border-indigo-200 text-2xl font-black text-indigo-950">
                {startNum}{" "}
                <span
                  className={
                    rule.op === "+" ? "text-emerald-600" : "text-orange-500"
                  }
                >
                  {rule.op}
                  {rule.val}
                </span>{" "}
                ={" "}
                <span className="text-slate-400">
                  {practiceIsCorrect === true ? answer : "?"}
                </span>
              </div>
            ) : (
              <div className="bg-white px-4 py-2 rounded-2xl border-2 border-indigo-200 text-xl font-black text-indigo-950">
                Answer:{" "}
                <span
                  className={
                    practiceIsCorrect === true
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }
                >
                  {practiceIsCorrect === true ? `${answer}${answerUnit}` : "?"}
                </span>
              </div>
            )}
          </div>
        </div>

        {isCustomizableRule && (
          <div className="bg-white p-3 rounded-2xl border-2 border-pink-300 shadow-sm flex flex-wrap items-center gap-3">
            <span className="font-bold text-pink-900 text-sm sm:text-base">
              Custom Start Number:
            </span>
            <input
              type="number"
              min={rule.op === "-" ? rule.val : 0}
              value={practiceCustomStart}
              onChange={(e) => setPracticeCustomStart(e.target.value)}
              className="w-24 p-2 border-2 border-pink-200 rounded-xl font-black text-center text-indigo-950 outline-none focus:border-pink-500"
              placeholder={startNum}
            />
            <button
              onClick={() => {
                const val = parseInt(practiceCustomStart, 10);
                const minAllowed = rule.op === "-" ? rule.val : 0;
                if (!isNaN(val) && val >= minAllowed) {
                  loadNewPracticeQuestion(rule.id, val);
                }
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white font-black px-4 py-2 rounded-xl transition-colors"
            >
              Start Hops
            </button>
            {rule.sliding && (
              <button
                onClick={() => loadNewPracticeQuestion(rule.id, null)}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-black px-3 py-2 rounded-xl text-sm transition-colors"
              >
                New Random Start
              </button>
            )}
          </div>
        )}

        {isCoins ? (
          <InteractiveCoinBoard
            question={practiceQuestion}
            animStepIndex={practiceAnimStep}
            showHintPreview={practiceShowHint}
          />
        ) : isPlaceValue ? (
          <InteractivePlaceValueBoard
            question={practiceQuestion}
            animStepIndex={practiceAnimStep}
            showHintPreview={practiceShowHint}
            isAnsweredCorrectly={practiceIsCorrect === true}
          />
        ) : isClock ? (
          <InteractiveClockBoard
            question={practiceQuestion}
            userTime={practiceClockTime}
            onUserTimeChange={(h, m) =>
              setPracticeClockTime({ hour: h, minute: m })
            }
            animStepIndex={practiceAnimStep}
            showHintPreview={practiceShowHint}
            isAnsweredCorrectly={practiceIsCorrect === true}
          />
        ) : (
          <InteractiveNumberLine
            question={practiceQuestion}
            mascotEmoji={activeStudent?.avatarEmoji}
            animStepIndex={practiceAnimStep}
            showHintPreview={practiceShowHint}
            onNumberTap={handlePracticeAnswerTap}
            selectedAnswer={practiceSelectedAns}
            isCorrect={practiceIsCorrect}
          />
        )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={handleDemonstrateRule}
            className="sm:col-span-4 bg-amber-100 py-2 rounded-2xl border-2 border-amber-400 text-amber-900 font-bold flex justify-center items-center gap-2"
          >
            <HelpCircle className="w-5 h-5" /> {helpButtonText}
          </button>
          {practiceIsCorrect === true ? (
            <div className="sm:col-span-4 bg-emerald-100 border-2 border-emerald-500 rounded-3xl p-4 flex justify-between items-center">
              <span className="font-black text-xl text-emerald-900">
                Great Job!
              </span>
              <button
                onClick={() => {
                  const currentRule = practiceQuestion.rule.id;
                  if (practiceQuestion.rule.max) {
                    const nextStart = practiceQuestion.answer;
                    if (
                      practiceQuestion.rule.op === "-" &&
                      nextStart < practiceQuestion.rule.val
                    ) {
                      loadNewPracticeQuestion(currentRule, null);
                    } else {
                      loadNewPracticeQuestion(currentRule, nextStart);
                    }
                  } else {
                    loadNewPracticeQuestion();
                  }
                }}
                className="bg-emerald-500 text-white font-black px-6 py-2 rounded-xl transition-transform active:scale-95"
              >
                Next →
              </button>
            </div>
          ) : isClock && practiceQuestion.clock?.qMode === "set_clock" ? (
            <button
              onClick={() =>
                handlePracticeAnswerTap(
                  formatClockTime(
                    practiceClockTime.hour,
                    practiceClockTime.minute,
                  ),
                )
              }
              className={`sm:col-span-4 py-4 rounded-2xl font-black text-2xl border-b-4 transition-all active:scale-95 ${
                practiceIsCorrect === false
                  ? "bg-rose-500 hover:bg-rose-600 border-rose-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 border-indigo-800 text-white"
              }`}
            >
              Check My Clock (
              {formatClockTime(
                practiceClockTime.hour,
                practiceClockTime.minute,
              )}
              )
            </button>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                onClick={() => handlePracticeAnswerTap(opt)}
                className={`py-4 rounded-2xl font-black text-2xl border-b-4 transition-all ${practiceSelectedAns === opt && practiceIsCorrect === false ? "bg-rose-200 border-rose-500 text-rose-900" : "bg-white border-indigo-300 text-indigo-950"}`}
              >
                {opt}
                {answerUnit}
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
    const isCoins = currentQ.rule.category === "COINS";
    const isPlaceValue = currentQ.rule.category === "PLACE_VALUE";
    const isClock = currentQ.rule.category === "CLOCK";
    const unit = currentQ.answerUnit || "";

    return (
      <div className="max-w-4xl mx-auto px-2 py-4 space-y-3">
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-amber-300 mb-3 shadow-sm">
          <div className="flex flex-col">
            <span className="font-black text-amber-600 uppercase text-xs tracking-wider">
              No Retries
            </span>
            <span className="font-black text-indigo-950 text-lg sm:text-xl flex items-center gap-2">
              {quizRuleScope === "ALL"
                ? "🎲 Mixed Scope"
                : quizRuleScope === "ADD"
                  ? "➕ All Addition"
                  : quizRuleScope === "SUB"
                    ? "➖ All Subtraction"
                    : `🎯 Quiz: ${MATH_RULES[quizRuleScope]?.label || quizRuleScope}`}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 bg-indigo-50/80 px-3 py-2 rounded-xl border-2 border-indigo-100 flex-wrap justify-end">
            {quizQuestions.map((_, i) => {
              if (i < quizAnswers.length) {
                return quizAnswers[i].isCorrect ? (
                  <CheckCircle2
                    key={i}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-emerald-500 drop-shadow-sm"
                  />
                ) : (
                  <XCircle
                    key={i}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-rose-500 drop-shadow-sm"
                  />
                );
              }
              return (
                <div
                  key={i}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 border-2 border-slate-300 shadow-inner"
                ></div>
              );
            })}
          </div>
        </div>

        {isCoins ? (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => sound.speak(currentQ.voicePrompt)}
                className="flex items-center gap-1.5 bg-amber-100 text-amber-900 border-2 border-amber-300 px-3 py-1 rounded-xl font-bold text-sm"
              >
                <Volume2 className="w-4 h-4" /> Read Question
              </button>
            </div>
            <InteractiveCoinBoard
              question={currentQ}
              animStepIndex={quizAnimStep}
              showHintPreview={false}
            />
          </div>
        ) : isPlaceValue ? (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => sound.speak(currentQ.voicePrompt)}
                className="flex items-center gap-1.5 bg-indigo-100 text-indigo-900 border-2 border-indigo-300 px-3 py-1 rounded-xl font-bold text-sm"
              >
                <Volume2 className="w-4 h-4" /> Read Question
              </button>
            </div>
            <InteractivePlaceValueBoard
              question={currentQ}
              animStepIndex={quizAnimStep}
              showHintPreview={false}
              isAnsweredCorrectly={isAnswered}
            />
          </div>
        ) : isClock ? (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => sound.speak(currentQ.voicePrompt)}
                className="flex items-center gap-1.5 bg-rose-100 text-rose-900 border-2 border-rose-300 px-3 py-1 rounded-xl font-bold text-sm"
              >
                <Volume2 className="w-4 h-4" /> Read Question
              </button>
            </div>
            <InteractiveClockBoard
              question={currentQ}
              userTime={quizClockTime}
              onUserTimeChange={(h, m) =>
                setQuizClockTime({ hour: h, minute: m })
              }
              animStepIndex={quizAnimStep}
              showHintPreview={false}
              isAnsweredCorrectly={isAnswered}
            />
          </div>
        ) : (
          <div className="bg-indigo-50 p-4 rounded-3xl border-2 border-indigo-200 text-center text-4xl font-black text-indigo-950">
            {currentQ.startNum}{" "}
            <span
              className={
                currentQ.rule.op === "+" ? "text-emerald-600" : "text-orange-600"
              }
            >
              {currentQ.rule.op}
              {currentQ.rule.val}
            </span>{" "}
            = {isAnswered ? currentQ.answer : "?"}
          </div>
        )}

        {isClock && currentQ.clock?.qMode === "set_clock" ? (
          <div className="pt-1">
            <button
              disabled={isAnswered}
              onClick={() =>
                handleQuizAnswerTap(
                  formatClockTime(quizClockTime.hour, quizClockTime.minute),
                )
              }
              className={`w-full py-4 rounded-2xl font-black text-2xl border-b-4 transition-all active:scale-95 ${
                isAnswered
                  ? quizLockedChoice === currentQ.answer
                    ? "bg-emerald-500 border-emerald-700 text-white"
                    : "bg-rose-500 border-rose-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 border-indigo-800 text-white"
              }`}
            >
              {isAnswered
                ? quizLockedChoice === currentQ.answer
                  ? `✅ Correct! (${currentQ.answer})`
                  : `❌ Answer was ${currentQ.answer}`
                : `Submit My Clock (${formatClockTime(quizClockTime.hour, quizClockTime.minute)})`}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {currentQ.options.map((opt) => {
              const isSelected = quizLockedChoice === opt;
              const isCorrectOpt = opt === currentQ.answer;
              let btnStyle =
                "bg-white hover:bg-indigo-50 border-indigo-300 text-indigo-950";
              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle =
                    "bg-emerald-500 border-emerald-700 text-white scale-[1.02]";
                } else if (isSelected) {
                  btnStyle = "bg-rose-400 border-rose-600 text-white";
                } else {
                  btnStyle =
                    "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => handleQuizAnswerTap(opt)}
                  className={`py-4 rounded-2xl font-black text-2xl border-b-4 transition-all active:scale-95 ${btnStyle}`}
                >
                  {opt}
                  {unit}
                </button>
              );
            })}
          </div>
        )}
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
                          className={`border rounded-xl p-2 flex flex-col items-center justify-center text-center ${colorClass}`}
                        >
                          <div className="font-black text-base">
                            {MATH_RULES[rk]?.label || rk}
                          </div>
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
                                    <div className="font-bold text-slate-800 text-sm">
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
                <div className="text-4xl mb-1 filter drop-shadow-sm">
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
        {currentView === "LESSON" && MATH_RULES[activeLessonRuleKey] && (
          <InteractiveLessonView
            rule={MATH_RULES[activeLessonRuleKey]}
            mascotEmoji={activeStudent?.avatarEmoji}
            onStartPractice={(rk) => {
              handlePracticeRuleSelect(rk);
              setCurrentView("PRACTICE");
            }}
            onStartQuiz={(rk) => startNewQuiz(rk)}
            onBackHome={() => setCurrentView("HOME")}
          />
        )}
        {currentView === "PRACTICE" && renderPracticeView()}
        {currentView === "QUIZ" && renderQuizView()}
        {currentView === "STICKERS" && renderStickersView()}
        {currentView === "DASHBOARD" && renderDashboardView()}
      </main>
    </div>
  );
}
