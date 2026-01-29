"use client"
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import React, { useState } from "react";



export default function BasicTables() {
  const [value, setValue] = useState("");
  return (
    <div>
      <PageBreadcrumb pageTitle="All Ads" />
      <div className="space-y-6">
        <ComponentCard title="User Who are listed on the website">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-whtie">
                Choose City
              </Label>
              <Select 
            placeholder="Choose city"
            options={[
              { value: "indore", label: "Indore"}
            ]}
            onChange={(val) => setValue(val)}
            
            />
            </div>
            
            <div>
              <Label className="text-whtie">
                Choose Local
              </Label>
              <Select 
            placeholder="Choose city"
            options={[
              { value: "indore", label: "Indore"}
            ]}
            onChange={(val) => setValue(val)}
            
            />
            </div>
            <div className="flex items-end">
              <Button>Filter</Button>
            </div>
              
           
          </div>
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
