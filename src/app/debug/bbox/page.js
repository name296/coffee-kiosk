import { redirect } from "next/navigation";

/** 개발용: bbox 디버그 → /?debug=bbox */
export default function BboxDebugPage() {
    redirect("/?debug=bbox");
}
