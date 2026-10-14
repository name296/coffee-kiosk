import { redirect } from "next/navigation";

/** 텍스트 높이 디버그 → /?debug=text */
export default function TextDebugPage() {
    redirect("/?debug=text");
}
