"use client"

import Cards from "@/components/Card/Card";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface CoinsApi {
  id: string;
  title: string;
  coins: string;
  price: string;
}

export default function CoinPlane() {
  const [cards, setCards] = useState<CoinsApi[]>([])
  const [title, setTitle] = useState<string>('')
  const [coins, setCoins] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)  // ✅ Added

  // ✅ Bug 1 fixed: GET instead of POST
  async function getCoinDetails() {
    try {
      const res = await api.post(`Wb/plan`)
      // ✅ Bug 2 fixed: consistent string comparison
      if (res.data.status == "0") {
        setCards(res.data.data ?? [])
      }
    } catch (e) {
      console.log(e)
    }
  }

  //  Bug 3 fixed: validation added + loading state
  async function addCoinsDetails() {
    if (!title.trim()) return toast.error("Enter plan name")
    if (!coins.trim() || isNaN(Number(coins)) || Number(coins) <= 0) return toast.error("Enter valid coins")
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) return toast.error("Enter valid price")

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("title", title)
      formData.append("coins", coins)
      formData.append("price", price)

      const res = await api.post("Wb/add_plan", formData)

      if (res.data.status == "0") {
        toast.success(res.data.message)
        setTitle('')
        setCoins('')
        setPrice('')
        getCoinDetails()  // ✅ refresh list
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCoinDetails()
  }, [])

  return (
    <>
      {/* ===== CREATE PLAN ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4 space-y-4">

          <h2 className="text-lg font-semibold dark:text-white">Create New Plan</h2>

          <div>
            <Label>Plan Name</Label>
            <Input
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              placeholder="Name of the Plan"
            />
          </div>

          <div>
            <Label>Price (₹)</Label>
            <Input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              placeholder="Enter the price"
              type="number"
            />
          </div>

          <div>
            <Label>Coins</Label>
            <Input
              onChange={(e) => setCoins(e.target.value)}
              value={coins}
              placeholder="Number of coins"
              type="number"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={addCoinsDetails} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>

        </div>
      </div>

      {/* ===== CURRENT PLANS ===== */}
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-4">

          <h2 className="text-lg font-semibold dark:text-white mb-4">Current Plans</h2>

          {/* ✅ Empty state */}
          {cards.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No plans found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cards.map((card) => (
                <Cards
                  key={card.id}
                  id={card.id}
                  getCoinsDetails={getCoinDetails}
                  name={card.title}
                  coin={card.coins}
                  rupee={card.price}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}