"use client"

import InputGroup from "@/components/form/form-elements/InputGroup";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { EnvelopeIcon } from "@/icons";
import { useState } from "react";


export default function HomePage() {
    const searches = [
        "call girl in Indore",
        "call girl in Jaipur",
        "call girl in Delhi",
        "call girl in Mumbai",
        "call girl in Bangalore",
        "call girl in Pune",
        "call girl in Ahmedabad",
        "call girl in Bhopal",
        "call girl in Noida",
        "call girl in Gurugram",
        "call girl in Chandigarh",
        "call girl in Kolkata",
        "call girl in Chennai",
        "call girl in Hyderabad",
        "call girl in Surat",
        "call girl in Vadodara",
        "call girl in Udaipur",
        "call girl in Jodhpur"
      ]
      const [open , setOpne] = useState<boolean>(false)
    return (
        <>
            <div className=" rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="p-3">
                    <h1 className="text-white text-2xl p-2">Meta Details Of The Site</h1>
                    <div>
                        <div className="grid grid-cols-1 gap-3">
                            
                            <div className="col-span-1 relative mt-2">
                                <Input
                                    placeholder="Affair Escorts"
                                    type="text"
                                    className="pl-[120px]"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    Site Titile
                                </span>
                            </div>
                            <div className="col-span-1 relative mt-2">
                                <Input
                                    placeholder="Affair Escorts"
                                    type="text"
                                    className="pl-[150px]"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    Site Discription
                                </span>
                            </div>
                            <Button className="mt-5">Save Change</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className=" mt-10 rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <h1 className="text-white text-2xl p-2">Home Page Tabs</h1>
                        <div className="grid grid-cols-6">
                        {
                            searches.map((name ,index)=>(
                             <span key={index} className="m-2"> <Badge size="lg" >{name}</Badge></span>  
                            ))
                        }
                        <Button onClick={()=> setOpne(true)} className="col-span-6 mt-5">Add More</Button>
                        </div>
                        
                        
                    <Modal isOpen={open} onClose={()=>setOpne(false)} showCloseButton={true} >
                            <div className="text-white p-3">
                                <h1 className="text-xl m-3">Add Tag name</h1>
                                <Label className="mt-5">Tag Name</Label>
                                    <Input placeholder="call girl in indore" className="" type="text" />
                                    <Label className="mt-5">Link to Tag</Label>
                                    <Input placeholder="https://affairescorts.com/call-girl-indore" className="" type="text" />
                                    <Button className="mt-4 w-full">Add</Button>
                            </div>
                    </Modal>
                   
            </div>

        </>
    )
}