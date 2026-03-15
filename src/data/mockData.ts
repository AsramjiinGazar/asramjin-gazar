/** XP required to level up. At 100 XP, level increases by 1 and current XP resets to 0. No level cap. */
export const XP_PER_LEVEL = 100;

export interface Student {
  id: number;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  favoriteSubject: string;
  success: string;
}

/** Total XP (for ranking). Equals level * XP_PER_LEVEL + xp. */
export function getTotalXp(s: Student): number {
  return s.level * XP_PER_LEVEL + s.xp;
}

export const students: Student[] = [
  { id: 1, name: "Азбаяр", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Computer Science", success: "" },
  { id: 2, name: "Алтангэрэл", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Art", success: "" },
  { id: 3, name: "Амин-Эрдэнэ", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Music", success: "" },
  { id: 4, name: "Амина", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Physics", success: "" },
  { id: 5, name: "Бадамдорж", level: 0, xp: 0, maxXp: 100, favoriteSubject: "PE", success: "" },
  { id: 6, name: "Баярбаясгалан", level: 0, xp: 0, maxXp: 100, favoriteSubject: "English", success: "" },
  { id: 7, name: "Билгүүн", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Mathematics", success: "" },
  { id: 8, name: "Билэгдэмбэрэл", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 9, name: "Галдан", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 10, name: "Гантигмаа", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 11, name: "Маргад", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 12, name: "О.Мишээл", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 13, name: "Б.Мишээл", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 14, name: "Н.Мишээл", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 15, name: "Мөнххүслэн", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 16, name: "Нарансондор", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 17, name: "Сайханбилэг", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 18, name: "Сандагдорж", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 19, name: "Сувд", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 20, name: "Сэргэлэн", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 21, name: "Төгөлдөр", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 22, name: "Төрболд", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 23, name: "Түвшинзаяа", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 24, name: "Тэмүүлэн", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 25, name: "Тэргүүлэл", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 26, name: "Хулан", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 27, name: "Цолмонбилэг", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 28, name: "Чингүн", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 29, name: "Шинээбаяр", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 30, name: "Энхжин", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
  { id: 31, name: "Энэрэлт-Од", level: 0, xp: 0, maxXp: 100, favoriteSubject: "Biology", success: "" },
];

export const recentPosts = [
  { id: 1, author: "Mia Johnson", text: "Just finished my art project! 🎨", likes: 12, time: "2h ago" },
  { id: 2, author: "Jake Rivera", text: "Who's up for a study group tomorrow?", likes: 8, time: "4h ago" },
  { id: 3, author: "Luna Kim", text: "Check out this cool experiment! 🔬", likes: 15, time: "5h ago" },
];

export const galleryPhotos = [
  { id: 1, url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=400&fit=crop", category: "Trips", likes: 24, author: "Zoe Taylor" },
  { id: 2, url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=400&fit=crop", category: "School life", likes: 18, author: "Mia Johnson" },
  { id: 3, url: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&h=400&fit=crop", category: "Events", likes: 32, author: "Alex Chen" },
  { id: 4, url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop", category: "Trips", likes: 45, author: "Luna Kim" },
  { id: 5, url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop", category: "School life", likes: 11, author: "Noah Garcia" },
  { id: 6, url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop", category: "Events", likes: 28, author: "Emma Wilson" },
  { id: 7, url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&h=400&fit=crop", category: "Memes", likes: 56, author: "Sam Patel" },
  { id: 8, url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop", category: "School life", likes: 21, author: "Jake Rivera" },
];

export const quests = {
  daily: [
    { id: 1, title: "Comment on a post", xp: 10, progress: 0, total: 1 },
    { id: 2, title: "Upload a photo", xp: 15, progress: 0, total: 1 },
    { id: 3, title: "React to 3 posts", xp: 10, progress: 1, total: 3 },
  ],
  weekly: [
    { id: 4, title: "Complete 5 daily quests", xp: 100, progress: 2, total: 5 },
    { id: 5, title: "Visit every page", xp: 50, progress: 4, total: 6 },
    { id: 6, title: "Earn 100 XP", xp: 75, progress: 60, total: 100 },
  ],
};
