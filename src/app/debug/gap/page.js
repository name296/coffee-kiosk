import { redirect } from "next/navigation";

/** 개발용: 간격 디버그 → /?debug=gap (기본 32px 미만) */
export default function GapDebugPage() {
    redirect("/?debug=gap");
}
