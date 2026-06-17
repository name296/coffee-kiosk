import { redirect } from "next/navigation";

/** 개발용: focus 디버그 → /?debug=focus */
export default function FocusDebugPage() {
    redirect("/?debug=focus");
}
