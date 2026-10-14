import { redirect } from "next/navigation";

/** bbox 디버그 → /?debug=bbox */
export default function BboxDebugPage() {
    redirect("/?debug=bbox");
}
