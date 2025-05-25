"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Company information interface
interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Legal document interface
interface LegalDocument {
  title: string;
  description: string;
  content: string;
  lastUpdated: string;
}

export default function LegalPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Company information state
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "MC CONVERSIONS LTD",
    email: "luke@mcconversions.uk",
    phone: "07494415834",
    address: "Pantycrai, Adfa, Newtown, Powys, sy163bx, United Kingdom"
  });
  
  // Privacy policy state
  const [privacyPolicy, setPrivacyPolicy] = useState<LegalDocument>({
    title: "Privacy Policy",
    description: "Privacy Policy for Oak Structures website",
    content: "",
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  
  // Terms of service state
  const [termsOfService, setTermsOfService] = useState<LegalDocument>({
    title: "Terms and Conditions",
    description: "Terms and Conditions for Oak Structures website",
    content: "",
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  
  // Loading states
  const [loadingPrivacy, setLoadingPrivacy] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);
  
  // Fetch privacy policy content
  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        // In a real app, this would be an API call to fetch the content
        // For now, we'll simulate by fetching the file content
        const response = await fetch('/api/legal/privacy-policy');
        if (response.ok) {
          const data = await response.json();
          setPrivacyPolicy(data);
        } else {
          // Fallback to default content if API fails
          const defaultContent = `
<h1 className="text-3xl font-bold mb-6">PRIVACY POLICY</h1>
<p className="text-gray-600 mb-8">Last updated May 24, 2025</p>

<div className="mb-8">
  <p>
    This Privacy Notice for ${companyInfo.name} ('we', 'us', or 'our'), describes how and why we might access, collect, store, use, and/or share ('process') your personal information when you use our services ('Services'), including when you:
  </p>
  <ul className="list-disc pl-6 my-4">
    <li>Visit our website, or any website of ours that links to this Privacy Notice</li>
    <li>Download and use our mobile application (Solidoakstructures), or any other application of ours that links to this Privacy Notice</li>
    <li>Engage with us in other related ways, including any sales, marketing, or events</li>
  </ul>
</div>

<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">SUMMARY OF KEY POINTS</h2>
  <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</p>
  <p className="my-2"><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</p>
  <p className="my-2"><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
  <p className="my-2"><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
  <p className="my-2"><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</p>
  <p className="my-2"><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
</div>

<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">WHAT INFORMATION DO WE COLLECT?</h2>
  <h3 className="text-xl font-semibold mb-2">Personal information you disclose to us</h3>
  <p><em><strong>In Short:</strong> We collect personal information that you provide to us.</em></p>
  <p className="my-2">
    We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
  </p>
  <p className="my-2">
    <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
  </p>
  <ul className="list-disc pl-6 my-4">
    <li>Names</li>
    <li>Phone numbers</li>
    <li>Email addresses</li>
    <li>Mailing addresses</li>
    <li>Usernames</li>
    <li>Passwords</li>
    <li>Contact preferences</li>
    <li>Billing addresses</li>
    <li>Debit/credit card numbers</li>
    <li>Contact or authentication data</li>
  </ul>
</div>

<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">HOW DO WE PROCESS YOUR INFORMATION?</h2>
  <p>
    <em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em>
  </p>
  <p className="my-2">
    We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
  </p>
  <ul className="list-disc pl-6 my-4">
    <li>To facilitate account creation and authentication and otherwise manage user accounts</li>
    <li>To deliver and facilitate delivery of services to the user</li>
    <li>To respond to user inquiries/offer support to users</li>
    <li>To send administrative information to you</li>
    <li>To fulfill and manage your orders</li>
    <li>To enable user-to-user communications</li>
    <li>To manage user accounts</li>
  </ul>
</div>

<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">CONTACT US</h2>
  <p>If you have questions or comments about this notice, you may email us at ${companyInfo.email} or contact us by post at:</p>
  <address className="not-italic my-4">
    ${companyInfo.name}<br />
    ${companyInfo.address}<br />
    Phone: ${companyInfo.phone}
  </address>
</div>
          `;
          
          setPrivacyPolicy({
            ...privacyPolicy,
            content: defaultContent,
            lastUpdated: new Date().toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
        toast({
          title: "Error",
          description: "Failed to load privacy policy content. Using default template.",
          variant: "destructive",
        });
      } finally {
        setLoadingPrivacy(false);
      }
    };
    
    const fetchTermsOfService = async () => {
      try {
        // In a real app, this would be an API call to fetch the content
        // For now, we'll simulate by fetching the file content
        const response = await fetch('/api/legal/terms-of-service');
        if (response.ok) {
          const data = await response.json();
          setTermsOfService(data);
        } else {
          // Fallback to default content
          setTermsOfService({
            ...termsOfService,
            content: "Default terms of service content...",
            lastUpdated: new Date().toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error("Error fetching terms of service:", error);
        toast({
          title: "Error",
          description: "Failed to load terms of service content. Using default template.",
          variant: "destructive",
        });
      } finally {
        setLoadingTerms(false);
      }
    };
    
    fetchPrivacyPolicy();
    fetchTermsOfService();
  }, []);
  
  // Update company info in legal documents
  useEffect(() => {
    // Update privacy policy with company info
    if (privacyPolicy.content) {
      let updatedContent = privacyPolicy.content;
      updatedContent = updatedContent.replace(/\${companyInfo\.name}/g, companyInfo.name);
      updatedContent = updatedContent.replace(/\${companyInfo\.email}/g, companyInfo.email);
      updatedContent = updatedContent.replace(/\${companyInfo\.phone}/g, companyInfo.phone);
      updatedContent = updatedContent.replace(/\${companyInfo\.address}/g, companyInfo.address);
      
      if (updatedContent !== privacyPolicy.content) {
        setPrivacyPolicy({
          ...privacyPolicy,
          content: updatedContent
        });
      }
    }
    
    // Update terms of service with company info
    if (termsOfService.content) {
      let updatedContent = termsOfService.content;
      updatedContent = updatedContent.replace(/\${companyInfo\.name}/g, companyInfo.name);
      updatedContent = updatedContent.replace(/\${companyInfo\.email}/g, companyInfo.email);
      updatedContent = updatedContent.replace(/\${companyInfo\.phone}/g, companyInfo.phone);
      updatedContent = updatedContent.replace(/\${companyInfo\.address}/g, companyInfo.address);
      
      if (updatedContent !== termsOfService.content) {
        setTermsOfService({
          ...termsOfService,
          content: updatedContent
        });
      }
    }
  }, [companyInfo]);
  
  // Save privacy policy
  const savePrivacyPolicy = async () => {
    setSavingPrivacy(true);
    try {
      // Make API call to save the content
      const response = await fetch('/api/legal/privacy-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: privacyPolicy.title,
          description: privacyPolicy.description,
          content: privacyPolicy.content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save privacy policy');
      }
      
      const data = await response.json();
      
      // Update last updated date
      setPrivacyPolicy({
        ...privacyPolicy,
        lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Success",
        description: "Privacy policy has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving privacy policy:", error);
      toast({
        title: "Error",
        description: "Failed to save privacy policy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingPrivacy(false);
    }
  };
  
  // Save terms of service
  const saveTermsOfService = async () => {
    setSavingTerms(true);
    try {
      // Make API call to save the content
      const response = await fetch('/api/legal/terms-of-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: termsOfService.title,
          description: termsOfService.description,
          content: termsOfService.content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save terms of service');
      }
      
      const data = await response.json();
      
      // Update last updated date
      setTermsOfService({
        ...termsOfService,
        lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Success",
        description: "Terms of service has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving terms of service:", error);
      toast({
        title: "Error",
        description: "Failed to save terms of service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingTerms(false);
    }
  };
  
  // Preview privacy policy
  const previewPrivacyPolicy = () => {
    // In a real app, this would open a preview in a new tab
    // For now, we'll navigate to the privacy policy page
    window.open('/privacy', '_blank');
  };
  
  // Preview terms of service
  const previewTermsOfService = () => {
    // In a real app, this would open a preview in a new tab
    // For now, we'll navigate to the terms of service page
    window.open('/terms', '_blank');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Legal Documents</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            This information will be used in your legal documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email Address</Label>
              <Input
                id="company-email"
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input
                id="company-phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Input
                id="company-address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="privacy-policy">
        <TabsList className="mb-4">
          <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="terms-of-service">Terms of Service</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy-policy">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Privacy Policy</CardTitle>
                  <CardDescription>
                    Edit your website's privacy policy. Last updated: {privacyPolicy.lastUpdated}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={previewPrivacyPolicy}
                  >
                    Preview
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Reset</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset your privacy policy to the default template. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setLoadingPrivacy(true);
                            setTimeout(() => {
                              // Reset to default template
                              const defaultContent = `Default privacy policy content...`;
                              setPrivacyPolicy({
                                ...privacyPolicy,
                                content: defaultContent,
                                lastUpdated: new Date().toISOString().split('T')[0]
                              });
                              setLoadingPrivacy(false);
                              toast({
                                title: "Reset Complete",
                                description: "Privacy policy has been reset to the default template.",
                              });
                            }, 1000);
                          }}
                        >
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPrivacy ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="privacy-title">Title</Label>
                    <Input
                      id="privacy-title"
                      value={privacyPolicy.title}
                      onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacy-description">Meta Description</Label>
                    <Input
                      id="privacy-description"
                      value={privacyPolicy.description}
                      onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="privacy-content">Content (HTML)</Label>
                      <span className="text-xs text-muted-foreground">
                        Use HTML tags for formatting. Company information will be automatically inserted.
                      </span>
                    </div>
                    <Textarea
                      id="privacy-content"
                      value={privacyPolicy.content}
                      onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, content: e.target.value })}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                <AlertTriangle className="inline-block mr-1 h-4 w-4" />
                Changes will be published immediately.
              </div>
              <Button
                onClick={savePrivacyPolicy}
                disabled={savingPrivacy || loadingPrivacy}
              >
                {savingPrivacy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms-of-service">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Terms of Service</CardTitle>
                  <CardDescription>
                    Edit your website's terms of service. Last updated: {termsOfService.lastUpdated}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={previewTermsOfService}
                  >
                    Preview
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Reset</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset your terms of service to the default template. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setLoadingTerms(true);
                            setTimeout(() => {
                              // Reset to default template
                              const defaultContent = `Default terms of service content...`;
                              setTermsOfService({
                                ...termsOfService,
                                content: defaultContent,
                                lastUpdated: new Date().toISOString().split('T')[0]
                              });
                              setLoadingTerms(false);
                              toast({
                                title: "Reset Complete",
                                description: "Terms of service has been reset to the default template.",
                              });
                            }, 1000);
                          }}
                        >
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTerms ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terms-title">Title</Label>
                    <Input
                      id="terms-title"
                      value={termsOfService.title}
                      onChange={(e) => setTermsOfService({ ...termsOfService, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terms-description">Meta Description</Label>
                    <Input
                      id="terms-description"
                      value={termsOfService.description}
                      onChange={(e) => setTermsOfService({ ...termsOfService, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="terms-content">Content (HTML)</Label>
                      <span className="text-xs text-muted-foreground">
                        Use HTML tags for formatting. Company information will be automatically inserted.
                      </span>
                    </div>
                    <Textarea
                      id="terms-content"
                      value={termsOfService.content}
                      onChange={(e) => setTermsOfService({ ...termsOfService, content: e.target.value })}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                <AlertTriangle className="inline-block mr-1 h-4 w-4" />
                Changes will be published immediately.
              </div>
              <Button
                onClick={saveTermsOfService}
                disabled={savingTerms || loadingTerms}
              >
                {savingTerms ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
