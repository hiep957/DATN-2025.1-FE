export type Product = {
  id: number;
};

export type Message = {
  id?: string;
  role: "user" | "assistant" | "bot"; // Mapping 'bot' -> 'assistant'
  content: string;
  metadata?: {
    products?: Product[];
  };
  createdAt?: Date;
};