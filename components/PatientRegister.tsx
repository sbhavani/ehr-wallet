import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

const PatientRegister = () => {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Registration</h1>
          <p className="text-muted-foreground">Register a new patient in the system</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-xl font-semibold flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender
              </Label>
              <Select>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">
              Address
            </Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="Full address"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              Register Patient
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRegister;
