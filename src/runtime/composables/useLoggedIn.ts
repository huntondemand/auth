
import type { Ref } from "vue";
import {
  useState
} from "#app";
export const useLoggedIn: () => Ref<boolean> = () => useState<boolean>("is_logged_in", () => false);
