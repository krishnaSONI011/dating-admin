"use client"

import Cards from "@/components/Card/Card";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface CoinsApi{
    id : string ;
    title : string ;
    coins : string ;
    price : string ;
}
export default function CoinPlane() {
    const [cards , setCards] = useState<CoinsApi[]>([])
    const [title , setTitle] = useState<string>('')
    const [coins , setCoins] = useState<string>('')
    const [price , setPrice] = useState<string>('')
    async  function getCoinDetils (){
        try{
            const res = await api.post(`Wb/plan`)
            if(res.data.status == 0){
                
                setCards(res.data.data)
            }
           
        }catch(e){
            console.log(e)
        }
    }
    async function addCoinsDetails() {
        
        try{
            const formData  = new FormData()
            formData.append("title" ,title)
            formData.append("coins" , coins)
            formData.append("price" , price)
            const res = await api.post("Wb/add_plan" , formData)
            if(res.data.status == "0"){
                toast.success(res.data.message)
                setTitle('')
                setCoins('')
                setPrice('')
                getCoinDetils()
            }
            else{
                toast.error(res.data.message)
            }
        }catch(e){
            console.log(e)
        }
    }
    
    useEffect(()=>{
       
        getCoinDetils ()
    },[])
   
    return (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] text-white">
            {/* For Creat plane */}
                <div className="p-3">
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
                        <Button onClick={addCoinsDetails}>
                            Save 
                        </Button>
                        
                    </div>
                </div>

            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] text-white">
                <div className="p-3">
                    <h1>Current Plane </h1>
                    <div className="grid grid-cols-3 gap-3">
                        {
                            cards.map((card)=>(
                                <Cards getCoinsDetails={getCoinDetils} id={card.id} key={card.id} name={card.title} coin={card.coins} rupee={card.price}/>
                            ))
                        }
                       
                    </div>
                </div>
            </div>

        </>
    )
}