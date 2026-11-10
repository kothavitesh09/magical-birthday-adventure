export type PandaAnimation =
  | "idle" | "look_left" | "look_right" | "look_up" | "head_tilt" | "sway" | "wave"
  | "happy" | "blush" | "surprise" | "shy" | "heart_holding" | "clap" | "sleep"
  | "walk" | "happy_walk" | "run" | "jump" | "sit" | "stand" | "celebrate" | "spin" | "hop"
  | "peek_door" | "present_envelope" | "hold_letter" | "look_cake" | "make_wish"
  | "join_paws" | "blow_candles" | "gift_pop" | "raise_paws" | "hold_heart"
  | "step_out" | "look_meter" | "present_doors" | "look_door_left" | "look_door_right"
  | "cover_cheeks" | "cover_eyes" | "hide_box" | "birthday_finale" | "paw_heart" | "point";

export type PandaExpression = "neutral" | "happy" | "sad" | "curious" | "surprised" | "sleepy" | "shy" | "blushing" | "excited" | "proud" | "affectionate" | "embarrassed";

export type AnimationCategory = "Everyday" | "Emotions" | "Full body" | "Birthday";

export type AnimationOption = {
  id: PandaAnimation;
  label: string;
  icon: string;
  category: AnimationCategory;
};
