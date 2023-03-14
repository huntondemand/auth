
import type { Ref } from "vue";
import {
  useState
} from "#imports";
export const useLoggedIn: () => Ref<boolean> = () => useState<boolean>("is_logged_in", () => false);
