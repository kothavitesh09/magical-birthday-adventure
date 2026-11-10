import { BIRTHDAY_GIRL_NAME } from "@/data/birthdayGirl";

export const birthdayLetter = {
  heading: `A Letter Just for You, ${BIRTHDAY_GIRL_NAME} 💌`,
  greeting: `To my dearest ${BIRTHDAY_GIRL_NAME},`,
  paragraphs: [
    "May all your dreams come true. 💗",
    "May your days be filled with happiness, your heart with beautiful memories, and your future with endless possibilities.",
    "Keep smiling, keep shining, and never forget how special you are.",
  ],
  signoff: "With all my love ♡",
  finale: {
    headline: `Happy Birthday, ${BIRTHDAY_GIRL_NAME}! 💗`,
    firstLine: `${BIRTHDAY_GIRL_NAME}, you are truly one of a kind.`,
    message: "May your world always be filled with happiness, laughter, love, endless opportunities, wonderful memories, and countless magical moments.",
    signoff: "Keep smiling, keep shining! ♡",
    closing: `You deserve all the happiness in the world, ${BIRTHDAY_GIRL_NAME}!`,
  },
} as const;
