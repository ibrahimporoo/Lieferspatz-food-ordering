"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Order, OrderItem } from "@/constants/types";
import { Textarea } from "../ui/textarea";
import { Dispatch, SetStateAction } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { formatCurrency } from "@/lib/formatters";

interface IProps {
  orderData: Order,
  setOrderData: Dispatch<SetStateAction<Order>>,
  handleAddOrder: (order: Order) => Promise<void>
}

export function CardModal({ orderData, setOrderData, handleAddOrder }: IProps) {

  return (
    <Dialog>
      <DialogTrigger asChild>
				<Button variant="orangeColor" className="rounded-none"
				>
					Jetzt bestellen
				</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{orderData.items[0].name}</DialogTitle>
          <DialogDescription>
            Preis: { orderData.items[0].preis }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="anmerkung">
              Anmerkung
            </Label>
            <Textarea id="anmerkung" placeholder="Ihre Nachricht zu uns..." value={orderData.anmerkung}
						onChange={(e) => setOrderData({ ...orderData, anmerkung: e.target.value })}
						/>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="anzahl">
              Anzahl
            </Label>
            <Input
              type="number"
              id="anzahl"
              className="w-24"
              value={orderData.items[0].anzahl}
              onChange={(e) => {
                if(+e.target.value >= 0) {
                  const updatedItems:OrderItem[] = orderData.items.map((item, index) =>
                    index === 0 ? { ...item, anzahl: Number(e.target.value) } : item
                  );
                  setOrderData({ ...orderData, total: formatCurrency(Number(updatedItems[0].preis * updatedItems[0].anzahl)), items: updatedItems });
                }
              }}
            />
          </div>
          <div>
            <p>Gesamtpreis: { orderData.total }</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={orderData.items[0].anzahl === 0}
              onClick={handleAddOrder}
              className="w-fit ml-auto"
              variant="orangeColor"
              type="submit"
            >
              In den Warenkorb legen
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
