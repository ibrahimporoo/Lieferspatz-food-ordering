import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function AvatarComp({ img }: { img: string | null }) {
  return (
    <Avatar>
      <AvatarImage src={img ? img : "https://github.com/shadcn.png"} alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}
