"use client"

import api from "@/lib/api";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import { Modal } from "../ui/modal";
import { useState } from "react";
import Input from "../form/input/InputField";

interface Cards{
    id : string;
    name : string ;
    coin : string ;
    rupee : string ;
    getCoinsDetails : () => Promise<void>
}
export default function Cards({id ,name ,coin , rupee ,getCoinsDetails } : Cards) {
    const [open , setOpen] = useState<true | false>(false)
    const [title , setTitle] = useState<string>('')
    const [coins , setCoins] = useState<string>('')
    const [price , setPrice] = useState<string>('')
    async function deleteCoin() {
        try{
            const formData = new FormData()
            formData.append("plan_id" , id)
            const res = await api.post("Wb/delete_plan" , formData)
            if(res.data.status == 0){
                toast.success(res.data.message)
                getCoinsDetails()
            }
            else{
                toast.error(res.data.message)
            }
        }catch(e){
            console.log
        }
    }
    async function updateCoin() {
            try{
                const formData = new FormData()
                formData.append("plan_id" , id)
                formData.append("title", title)
                formData.append("coins" , coins)
                formData.append("price" , price)

                const res = await api.post('Wb/update_plan' , formData)

                if(res.data.status == 0){
                   
                    toast.success(res.data.message)
                    getCoinsDetails()
                    setOpen(false)
                }
                else{
                    toast.error(res.data.message)
                }
            }catch(e){
                console.log(e)
            }
    }
    function openModal(){
        setTitle(name)
        setPrice(rupee)
        setCoins(coin)
        setOpen(true)
    }
    return (
        <>
            <div className="w-[300px] rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] text-white">
                <div className="p-3">
                    <h2 className="text-center text-xl">{name}</h2>
                    <div className="flex justify-around mt-5">
                        <div>
                           {coin}
                            <Label>Coin</Label>
                        </div>
                        <div>
                            {rupee}
                            <Label>Rupee</Label>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-around">
                        <Button onClick={deleteCoin} className="bg-red-500 hover:bg-red-600 ">Remove</Button>
                        <Button className=" " onClick={openModal}>Update</Button>
                    </div>
                </div>

                <Modal isOpen={open} onClose={()=> setOpen(false)}>
                <div className="py-20 px-4">
                    <div>
                        <Label>Enter the Name of plane</Label>
                        <Input onChange={(e)=> setTitle(e.target.value)} value={title} className="" placeholder="Name of the Plane" />
                    </div>
                    <div className="mt-4">
                        <Label>Price</Label>
                        <Input onChange={(e)=> setPrice(e.target.value)} value={price} className="" placeholder="Enter the Price of the plane" />
                    </div>
                    <div className="mt-4">
                        <Label>Coins</Label>
                        <Input onChange={(e)=> setCoins(e.target.value)} value={coins} className="" placeholder="Number of coin" />
                    </div>
                    <div className="mt-3 flex justify-end gap-3">
                        <Button onClick={updateCoin}>
                            Update 
                        </Button>
                        
                    </div>
                </div>
                </Modal>

            </div>


        </>
    )
}