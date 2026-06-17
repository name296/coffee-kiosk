import { redirect } from "next/navigation";

/** 개발용: image 디버그 → /?debug=image */
export default function ImageDebugPage() {
    redirect("/?debug=image");
}
