import { redirect } from "next/navigation";

/** focus 디버그 → /?debug=focus */
export default function FocusDebugPage() {
    redirect("/?debug=focus");
}
