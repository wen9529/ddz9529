import { GoogleGenAI, Type } from "@google/genai";
import { Card, PlayedHand, PlayerRole } from "../types";
import { formatHandForAI } from "../utils/gameUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

export const getBotMove = async (
  botHand: Card[],
  lastPlayedHand: PlayedHand | null,
  botRole: PlayerRole,
  _landlordRole: PlayerRole | null,
  _tableCards: Card[] // All visible cards or history could be passed, simplifing to just last hand for now
): Promise<Card[]> => {
  
  // Construct a prompt context
  const handStr = formatHandForAI(botHand);
  const lastMoveStr = lastPlayedHand 
    ? `对手出牌: ${formatHandForAI(lastPlayedHand.cards)}` 
    : "你先出牌 (自由出牌).";
  
  const roleStr = botRole === PlayerRole.Landlord ? "地主" : "农民";
  
  const systemInstruction = `
    你是一位精通中国斗地主（Dou Dizhu）的专家玩家。
    你的目标：尽快出完手中的牌以获得胜利。
    
    规则摘要：
    - 你出的牌必须在牌型和大小上都大过“上家出的牌”。
    - 如果“上家”是“自由出牌”状态，你可以出任何合法的牌型（单张、对子、顺子、炸弹等）。
    - 如果你要不起，或者出于策略考虑不想出，请返回空数组代表“不出（PASS）”。
    - 牌力值（从小到大）: 3,4,5,6,7,8,9,10,J,Q,K,A,2,小王 (Small Joker), 大王 (Big Joker).
    - 花色不影响大小，只看点数。
    
    你的身份: ${roleStr}.
    你的手牌: ${handStr}
    当前牌桌状态: ${lastMoveStr}

    策略建议:
    - 如果你是农民且地主出了一张很小的牌，尝试阻击。
    - 如果你是地主，保持控制权。
    
    输出格式:
    返回一个JSON对象。
    'move': 你要出的牌的字符串数组。必须严格匹配你手牌中的字符串格式（例如 ["3♥", "4♠"] 或 ["Small Joker"]）。如果不出，返回 []。
    'reasoning': 用简短的中文解释你的出牌思路。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "请出牌。",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The array of card strings to play. Empty if passing."
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief thought process for the move in Chinese."
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    const cardsToPlayStrings: string[] = json.move || [];

    // Map strings back to Card objects
    const cardsToPlay: Card[] = [];
    
    // We need to find the specific card objects in the bot's hand that match the strings returned by AI
    // The AI returns formatted strings like "3♥". We need to match these to the internal Card objects.
    const tempHand = [...botHand];
    
    for (const str of cardsToPlayStrings) {
      // Find index
      const idx = tempHand.findIndex(c => {
        if (c.value >= 16) return c.rank === str;
        return `${c.rank}${c.suit}` === str;
      });

      if (idx !== -1) {
        cardsToPlay.push(tempHand[idx]);
        tempHand.splice(idx, 1); // Remove so we don't pick same card twice if multiple identical ranks exist (unlikely in single deck but good safety)
      }
    }

    return cardsToPlay;

  } catch (error) {
    console.error("AI Move Error:", error);
    return []; // Pass on error
  }
};

export const getHint = async (
  humanHand: Card[],
  lastPlayedHand: PlayedHand | null
): Promise<{ cards: Card[], reasoning: string }> => {
  
  const handStr = formatHandForAI(humanHand);
  const lastMoveStr = lastPlayedHand 
    ? `对手出牌: ${formatHandForAI(lastPlayedHand.cards)}` 
    : "自由出牌.";

  const systemInstruction = `
    你是一个斗地主助手。请用中文建议玩家的最佳出牌。
    玩家手牌: ${handStr}
    当前牌桌: ${lastMoveStr}
    输出JSON，包含 'move' (牌的字符串数组) 和 'reasoning' (中文理由)。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "给我一个建议。",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });
    
    const json = JSON.parse(response.text || "{}");
    const cardsToPlayStrings: string[] = json.move || [];
    const reasoning = json.reasoning || "没有提供理由。";

    const cardsToPlay: Card[] = [];
    const tempHand = [...humanHand];
    for (const str of cardsToPlayStrings) {
      const idx = tempHand.findIndex(c => {
        if (c.value >= 16) return c.rank === str;
        return `${c.rank}${c.suit}` === str;
      });
      if (idx !== -1) {
        cardsToPlay.push(tempHand[idx]);
        tempHand.splice(idx, 1);
      }
    }
    
    return { cards: cardsToPlay, reasoning };

  } catch (e) {
    return { cards: [], reasoning: "AI 服务暂时不可用。" };
  }
};