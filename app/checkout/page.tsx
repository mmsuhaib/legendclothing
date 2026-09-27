"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Lock,
  UserCheck,
  LogIn,
  UserPlus,
  AlertCircle,
  CreditCard,
  MapPin,
  Copy,
  Check,
  Building2,
  Banknote,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/auth-context";
import GoogleLoginButton from "@/components/google-login-button";
import FloatingInput from "@/components/checkout/floating-input";
import FloatingPhoneInput from "@/components/checkout/floating-phone-input";
import FloatingSelect from "@/components/checkout/floating-select";

// WhatsApp Brand Icon component
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.301-.15-1.782-.88-2.059-.98-.277-.1-.479-.15-.68.15-.202.301-.782.98-.958 1.181-.177.202-.353.226-.654.076-.301-.15-1.272-.469-2.423-1.497-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.134.301-.351.452-.527.151-.176.202-.301.302-.502.1-.201.05-.377-.025-.527-.075-.151-.68-1.637-.932-2.243-.245-.59-.494-.51-.68-.52l-.578-.01c-.201 0-.528.075-.805.376-.276.302-1.056 1.031-1.056 2.515 0 1.484 1.082 2.916 1.233 3.117.15.201 2.129 3.251 5.158 4.56.72.312 1.282.498 1.721.637.724.23 1.383.197 1.904.12.58-.087 1.782-.728 2.033-1.432.251-.704.251-1.307.176-1.432-.076-.125-.277-.2-.578-.351zM12.056 21.685c-1.748 0-3.46-.46-4.97-1.332l-.356-.211-3.696.97.986-3.604-.232-.369A9.626 9.626 0 012.399 12.06c0-5.334 4.34-9.674 9.677-9.674 2.583 0 5.011 1.006 6.837 2.833a9.614 9.614 0 012.834 6.84c0 5.336-4.341 9.676-9.68 9.676zm8.17-17.848A11.56 11.56 0 0012.056.442C5.64.442.417 5.665.417 12.08c0 2.05.536 4.053 1.554 5.821L.05 23.95l6.236-1.636a11.59 11.59 0 005.77 1.528h.005c6.415 0 11.638-5.223 11.638-11.64 0-3.11-1.21-6.033-3.473-8.065z" />
    </svg>
  );
}

// Available Countries with Sri Lanka selected by default
const COUNTRY_OPTIONS = [
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Australia", label: "Australia" },
  { value: "Canada", label: "Canada" },
  { value: "Singapore", label: "Singapore" },
  { value: "India", label: "India" },
  { value: "Maldives", label: "Maldives" },
  { value: "Qatar", label: "Qatar" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "Italy", label: "Italy" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    clearCart,
    freeShippingThreshold,
    shippingFee,
    shippingLabel,
  } = useCart();
  const { toast } = useToast();
  const { user, isLoading: authLoading, login, register, logout } = useAuth();

  // Auth form states for inline authentication
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  // Clean Delivery Shipping Form State (Ship/Delivery Only)
  const [deliveryData, setDeliveryData] = useState({
    country: "Sri Lanka",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    contactNo1: "",
    contactNo2: "",
    saveForNextTime: true,
  });

  // Inline Validation Errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Payment Method Selection ("COD" or "ONLINE_TRANSFER")
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE_TRANSFER">("ONLINE_TRANSFER");
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Dynamic Bank Details loaded from CMS / database
  const [bankDetails, setBankDetails] = useState({
    bankName: "Hatton National Bank (HNB)",
    accountName: "M M Suhaib",
    accountNumber: "169020066035",
    branch: "Kinniya Branch",
    swiftCode: "HBLILKLX",
    instructions:
      "Direct deposit or online fund transfer to HNB account. Please share transfer receipt on WhatsApp for fast verification.",
  });

  const handleCopyAccount = () => {
    const accNumber = bankDetails.accountNumber || "169020066035";
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accNumber).catch(() => {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = accNumber;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        } catch {}
      });
    } else if (typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = accNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {}
    }
    setCopiedAccount(true);
    toast(`${bankDetails.bankName || "Bank"} Account Number copied: ${accNumber}`, "success");
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const [storeWhatsApp, setStoreWhatsApp] = useState("+94771234567");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  /**
   * Automatically load user profile & saved shipping address
   */
  const loadSavedAddress = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/customer/shipping-address");
      if (res.ok) {
        const data = await res.json();
        if (data?.address) {
          const addr = data.address;
          setDeliveryData((prev) => ({
            ...prev,
            country: addr.country || "Sri Lanka",
            firstName: addr.firstName || prev.firstName || (user.name ? user.name.split(" ")[0] : ""),
            lastName: addr.lastName || prev.lastName || (user.name ? user.name.split(" ").slice(1).join(" ") : ""),
            address: addr.address || prev.address,
            city: addr.city || prev.city,
            postalCode: addr.postalCode || prev.postalCode,
            contactNo1: addr.contactNo1
              ? addr.contactNo1.replace(/^\+94/, "").replace(/^0/, "").trim()
              : prev.contactNo1 || (user.phone ? user.phone.replace(/^\+94/, "").replace(/^0/, "").trim() : ""),
            contactNo2: addr.contactNo2
              ? addr.contactNo2.replace(/^\+94/, "").replace(/^0/, "").trim()
              : prev.contactNo2,
          }));
          return;
        }
      }
    } catch {
      // Fallback below
    }

    // Fallback to customer profile data
    const nameParts = (user.name || "").trim().split(" ");
    setDeliveryData((prev) => ({
      ...prev,
      firstName: prev.firstName || nameParts[0] || "",
      lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
      contactNo1: prev.contactNo1 || (user.phone ? user.phone.replace(/^\+94/, "").replace(/^0/, "").trim() : ""),
    }));
  }, [user]);

  useEffect(() => {
    loadSavedAddress();
  }, [loadSavedAddress]);

  // Load configured store WhatsApp number and bank details from CMS
  useEffect(() => {
    fetch("/api/cms")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.bank_details) {
          setBankDetails((prev) => ({
            ...prev,
            ...data.bank_details,
          }));
        }
        if (data?.store_contact?.whatsappNumber) {
          setStoreWhatsApp(data.store_contact.whatsappNumber);
        } else if (data?.whatsapp_number) {
          setStoreWhatsApp(data.whatsapp_number);
        }
      })
      .catch(() => { });
  }, []);

  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : shippingFee;
  const totalAmount = subtotal + shippingCost;

  // Empty cart state
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 border border-[#E8E5E0] bg-white flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 stroke-1 text-[#8E8B85]" />
        </div>
        <h2 className="text-xl font-light uppercase tracking-widest text-[#121212]">
          Your Bag is Empty
        </h2>
        <p className="text-xs text-[#66635F] mt-2 max-w-sm">
          Please select pieces from our curated collections before completing your order.
        </p>
        <Link
          href="/shop"
          className="mt-6 px-8 py-3.5 bg-[#121212] text-white text-xs uppercase tracking-widest hover:bg-[#9B783E] transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  const handleDeliveryChange = (field: string, val: string | boolean) => {
    setDeliveryData((prev) => ({ ...prev, [field]: val }));
    // Clear validation error when user begins typing
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (authError) setAuthError("");
  };

  /**
   * Handle Inline Sign In
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email.trim() || !authForm.password) {
      setAuthError("Please enter your email and password");
      return;
    }

    setAuthSubmitting(true);
    setAuthError("");

    const res = await login(authForm.email, authForm.password);
    setAuthSubmitting(false);

    if (!res.success) {
      setAuthError(res.error || "Sign in failed. Check your email and password.");
      toast(res.error || "Sign in failed", "error");
    } else {
      toast(`Signed in as ${res.user?.name || res.user?.email}`, "success");
      // Load saved address immediately
      loadSavedAddress();
    }
  };

  /**
   * Handle Inline Registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email.trim() || !authForm.password) {
      setAuthError("Email and password are required");
      return;
    }
    if (authForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }

    setAuthSubmitting(true);
    setAuthError("");

    const res = await register({
      email: authForm.email,
      password: authForm.password,
      name: authForm.name,
      phone: authForm.phone,
    });
    setAuthSubmitting(false);

    if (!res.success) {
      setAuthError(res.error || "Registration failed");
      toast(res.error || "Registration failed", "error");
    } else {
      toast("Account registered successfully!", "success");
      loadSavedAddress();
    }
  };

  /**
   * Delivery form validation logic
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!deliveryData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!deliveryData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!deliveryData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!deliveryData.address.trim()) {
      newErrors.address = "Full delivery address is required";
    }

    if (!deliveryData.city.trim()) {
      newErrors.city = "City is required (e.g. Kinniya)";
    }

    // Postal Code: Sri Lanka uses 5-digit postal codes
    const cleanPostal = deliveryData.postalCode.trim();
    if (!cleanPostal) {
      newErrors.postalCode = "Postal code is required (e.g. 31100)";
    } else if (deliveryData.country === "Sri Lanka" && !/^\d{5}$/.test(cleanPostal)) {
      newErrors.postalCode = "Enter a valid 5-digit postal code (e.g. 31100)";
    }

    // Contact No 1: Required Sri Lankan phone number (9 digits)
    const cleanPhone1 = deliveryData.contactNo1.replace(/\s+/g, "");
    if (!cleanPhone1) {
      newErrors.contactNo1 = "Contact No 1 is required";
    } else if (!/^\d{9}$/.test(cleanPhone1)) {
      newErrors.contactNo1 = "Enter a valid 9-digit phone number (e.g. 71 234 5678)";
    }

    // Contact No 2: Optional, but if provided must be 9 digits
    const cleanPhone2 = deliveryData.contactNo2.replace(/\s+/g, "");
    if (cleanPhone2 && !/^\d{9}$/.test(cleanPhone2)) {
      newErrors.contactNo2 = "Enter a valid 9-digit phone number or leave empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Builds the formatted WhatsApp message for the store concierge (safe characters, zero symbol corruption)
   */
  const buildWhatsAppMessage = (orderNumber: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullName = `${deliveryData.firstName.trim()} ${deliveryData.lastName.trim()}`.trim();
    const phone1 = `+94 ${deliveryData.contactNo1.trim()}`;
    const phone2 = deliveryData.contactNo2.trim() ? `+94 ${deliveryData.contactNo2.trim()}` : null;

    let msg = `*LEGEND CLOTHING - ORDER REQUEST*\n`;
    msg += `--------------------------------\n`;
    msg += `*Order ID:* #${orderNumber}\n`;
    msg += `*Client:* ${fullName}\n`;
    msg += `*Contact No 1:* ${phone1}\n`;
    if (phone2) {
      msg += `*Contact No 2:* ${phone2}\n`;
    }
    if (user?.email) {
      msg += `*Email:* ${user.email.trim()}\n`;
    }
    msg += `*Delivery Destination:*\n`;
    msg += `  ${deliveryData.address.trim()}\n`;
    msg += `  ${deliveryData.city.trim()}, ${deliveryData.postalCode.trim()}\n`;
    msg += `  ${deliveryData.country}\n\n`;

    const paymentLabel =
      paymentMethod === "ONLINE_TRANSFER"
        ? `Online Bank Transfer (${bankDetails.bankName || "Direct Deposit"})`
        : "Cash on Delivery (COD)";

    msg += `*Payment Method:* ${paymentLabel}\n`;
    if (paymentMethod === "ONLINE_TRANSFER") {
      msg += `  - Beneficiary: ${bankDetails.accountName}\n`;
      msg += `  - Bank: ${bankDetails.bankName}\n`;
      if (bankDetails.branch) {
        msg += `  - Branch: ${bankDetails.branch}\n`;
      }
      msg += `  - Account Number: ${bankDetails.accountNumber}\n`;
      msg += `  *(Transfer receipt will be shared below)*\n`;
    }
    msg += `\n`;

    cart.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}*\n`;
      msg += `   - Size: ${item.size || "Standard"} | Color: ${item.color || "Standard"}\n`;
      msg += `   - Qty: ${item.quantity} x LKR ${Math.round(item.price).toLocaleString()} = LKR ${(Math.round(item.price) * item.quantity).toLocaleString()}\n`;
    });

    msg += `\n--------------------------------\n`;
    msg += `*Subtotal:* LKR ${Math.round(subtotal).toLocaleString()}\n`;
    msg += `*${shippingLabel}:* ${shippingCost === 0 ? "Complimentary" : `LKR ${shippingCost.toLocaleString()}`}\n`;
    msg += `*Total Due:* LKR ${Math.round(totalAmount).toLocaleString()}\n`;
    msg += `--------------------------------\n`;
    msg += `*Online Order Details:* ${origin}/order/${orderNumber}\n\n`;
    msg += `Hello LEGEND Maison, I have submitted this order and would like to confirm dispatch instructions. Thank you!`;

    return msg;
  };

  /**
   * Main Handler: Validates Auth, Validates Delivery Fields & Creates order in DB
   */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Authentication Gate Enforcement
    if (!user) {
      toast("Please sign in or create an account in Step 1 to complete checkout", "error");
      const authElem = document.getElementById("step-1-auth");
      if (authElem) authElem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // 2. Validate Delivery Information
    if (!validateForm()) {
      toast("Please correct the highlighted fields in the delivery form", "error");
      const deliveryElem = document.getElementById("step-2-delivery");
      if (deliveryElem) deliveryElem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setSubmittingOrder(true);

    try {
      const fullName = `${deliveryData.firstName.trim()} ${deliveryData.lastName.trim()}`.trim();
      const formattedPhone1 = `+94 ${deliveryData.contactNo1.trim()}`;
      const formattedPhone2 = deliveryData.contactNo2.trim() ? `+94 ${deliveryData.contactNo2.trim()}` : null;

      // 3. If "Save this information for next time" is checked, persist securely
      if (deliveryData.saveForNextTime) {
        fetch("/api/customer/shipping-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country: deliveryData.country,
            firstName: deliveryData.firstName.trim(),
            lastName: deliveryData.lastName.trim(),
            address: deliveryData.address.trim(),
            city: deliveryData.city.trim(),
            postalCode: deliveryData.postalCode.trim(),
            contactNo1: formattedPhone1,
            contactNo2: formattedPhone2,
          }),
        }).catch(() => null);
      }

      // 4. Submit order to database with linked userId
      const orderPayload = {
        userId: user.id,
        customerName: fullName,
        customerEmail: user.email || `${deliveryData.contactNo1.replace(/\D/g, "")}@whatsapp.legend.com`,
        customerPhone: formattedPhone1,
        shippingAddress: deliveryData.address.trim(),
        apartment: formattedPhone2 || null, // Store secondary contact cleanly
        city: deliveryData.city.trim(),
        state: null,
        postalCode: deliveryData.postalCode.trim(),
        country: deliveryData.country,
        saveForNextTime: deliveryData.saveForNextTime,
        items: cart,
        subtotal,
        shippingFee: shippingCost,
        total: totalAmount,
        status: paymentMethod === "ONLINE_TRANSFER" ? "Pending Verification" : "WhatsApp Order",
        paymentMethod: paymentMethod === "ONLINE_TRANSFER" ? "BANK_TRANSFER" : "CASH_ON_DELIVERY",
        notes: null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to register order");
      }

      const orderData = await res.json();
      const orderNumber = orderData.orderNumber || `LEG-2026-${Date.now().toString().slice(-6)}`;

      // 5. Format WhatsApp Message
      const waMessage = buildWhatsAppMessage(orderNumber);
      const cleanPhone = storeWhatsApp.replace(/\D/g, "") || "15550192834";
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

      // 6. Clear shopping cart
      clearCart();

      // 7. Save confirmed order state
      setConfirmedOrder({
        ...orderData,
        waUrl,
      });

      toast("Order registered successfully! Opening WhatsApp...", "success");

      // 8. Open WhatsApp chat in a new tab
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }

      // 9. Navigate to order confirmation page
      router.push(`/order/${orderNumber}`);
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Could not complete order. Please try again.", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-[#E8E5E0] pb-6 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-px bg-[#9B783E]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9B783E] font-semibold">
              Maison Dispatch Coordinates
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-[0.15em] uppercase text-[#121212]">
            Checkout & Delivery
          </h1>
          <p className="text-xs text-[#66635F] mt-1 tracking-wide">
            Complete your delivery information below to ensure seamless direct courier dispatch.
          </p>
        </div>

        {/* Two-column layout: Form (7 cols) + Order Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Checkout Steps 1, 2, 3 */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: CLIENT LOGIN REQUIRED */}
            <div
              id="step-1-auth"
              className="bg-white border border-[#E8E5E0] rounded-[2px] shadow-xs overflow-hidden"
            >
              <div className="p-6 sm:p-7 border-b border-[#E8E5E0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${user ? "bg-[#2A6B46] text-white" : "bg-[#121212] text-white"
                      }`}
                  >
                    {user ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#121212]">
                      {user ? "Client Account Authenticated" : "1. Client Login Required"}
                    </h2>
                    <p className="text-[11px] text-[#66635F] mt-0.5">
                      {user
                        ? "Your order and delivery coordinates will be linked to your verified account."
                        : "Sign in with Google or your email to enter delivery coordinates."}
                    </p>
                  </div>
                </div>

                {user && (
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-[11px] text-[#8E8B85] hover:text-[#9B2C2C] underline transition-colors cursor-pointer"
                  >
                    Switch Account
                  </button>
                )}
              </div>

              {/* Logged in view */}
              {user ? (
                <div className="p-6 sm:p-7 bg-[#FBF9F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#9B783E]/15 border border-[#9B783E]/30 flex items-center justify-center text-[#9B783E] shrink-0 font-serif font-medium text-sm">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#121212]">
                          {user.name || "Valued Client"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-[#2A6B46]/10 text-[#2A6B46] border border-[#2A6B46]/20 font-medium tracking-wider uppercase rounded-full">
                          <UserCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#66635F] mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-[#2A6B46] font-medium tracking-wider uppercase block">
                      Profile Coordinates Connected
                    </span>
                  </div>
                </div>
              ) : (
                /* Unauthenticated View: Sign In / Create Account Tabs */
                <div className="p-6 sm:p-7 space-y-6">
                  {/* Google Fast Authentication */}
                  <div className="space-y-3.5">
                    <GoogleLoginButton
                      redirect="/checkout"
                      label="Continue with Google"
                    />

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-[#E8E5E0] w-full" />
                      <span className="bg-white px-3 text-[10px] text-[#8E8B85] uppercase tracking-widest font-medium shrink-0">
                        Or with email & password
                      </span>
                      <div className="border-t border-[#E8E5E0] w-full" />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-[#E8E5E0]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("login");
                        setAuthError("");
                      }}
                      className={`flex-1 pb-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${authTab === "login"
                          ? "border-[#121212] text-[#121212] font-semibold"
                          : "border-transparent text-[#8E8B85] hover:text-[#121212]"
                        }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("register");
                        setAuthError("");
                      }}
                      className={`flex-1 pb-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${authTab === "register"
                          ? "border-[#121212] text-[#121212] font-semibold"
                          : "border-transparent text-[#8E8B85] hover:text-[#121212]"
                        }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>

                  {/* Auth Error Banner */}
                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded-[2px]">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authTab === "login" ? (
                    /* Sign In Form */
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={authForm.email}
                          onChange={handleAuthInputChange}
                          required
                          placeholder="client@example.com"
                          className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
                        />
                      </div>

                      <div>
                        <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                          Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={authForm.password}
                          onChange={handleAuthInputChange}
                          required
                          placeholder="••••••••"
                          className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authSubmitting}
                        className="w-full py-3.5 bg-[#121212] hover:bg-[#9B783E] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {authSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>Sign In to Continue Checkout</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-center text-[#8E8B85]">
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthTab("register")}
                          className="text-[#9B783E] underline font-medium cursor-pointer"
                        >
                          Create one now
                        </button>
                      </p>
                    </form>
                  ) : (
                    /* Register Form */
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={authForm.name}
                            onChange={handleAuthInputChange}
                            placeholder="Julian Vance"
                            className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
                          />
                        </div>
                        <div>
                          <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                            Phone / WhatsApp
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={authForm.phone}
                            onChange={handleAuthInputChange}
                            placeholder="+94 77 123 4567"
                            className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={authForm.email}
                          onChange={handleAuthInputChange}
                          required
                          placeholder="client@example.com"
                          className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
                        />
                      </div>

                      <div>
                        <label className="block uppercase tracking-wider text-[#121212] mb-1 font-medium text-[11px]">
                          Create Password (min 6 chars) *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={authForm.password}
                          onChange={handleAuthInputChange}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full bg-[#FAF8F5] border border-[#E8E5E0] px-4 py-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212] rounded-[2px]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authSubmitting}
                        className="w-full py-3.5 bg-[#121212] hover:bg-[#9B783E] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {authSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Client Account...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Create Account & Continue</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-center text-[#8E8B85]">
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthTab("login")}
                          className="text-[#9B783E] underline font-medium cursor-pointer"
                        >
                          Sign in here
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: DELIVERY INFORMATION (SHIP ONLY) */}
            <div
              id="step-2-delivery"
              className={`bg-white border border-[#E8E5E0] p-6 sm:p-8 rounded-[2px] shadow-xs transition-opacity duration-300 relative ${!user ? "opacity-60 pointer-events-none select-none" : ""
                }`}
            >
              {!user && (
                <div className="absolute inset-0 bg-[#FAF8F5]/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-6 rounded-[2px]">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E8E5E0] shadow-sm flex items-center justify-center mb-2">
                    <Lock className="w-4 h-4 text-[#8E8B85]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
                    Delivery Coordinates Locked
                  </span>
                  <p className="text-[11px] text-[#66635F] mt-1 max-w-xs">
                    Please sign in or create an account in Step 1 above to complete your delivery coordinates.
                  </p>
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="border-b border-[#E8E5E0] pb-5 mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-7 h-7 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    2
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#121212]">
                    DELIVERY
                  </h2>
                </div>
                <p className="text-xs text-[#66635F] pl-10 leading-relaxed">
                  Provide accurate information to ensure seamless delivery. Your data is safe with us.
                </p>
              </div>

              {/* Delivery Fields */}
              <div className="space-y-4">
                {/* 1. Country (Full Width) */}
                <div>
                  <FloatingSelect
                    label="Country"
                    name="country"
                    value={deliveryData.country}
                    onChange={(e) => handleDeliveryChange("country", e.target.value)}
                    options={COUNTRY_OPTIONS}
                    error={errors.country}
                    required
                  />
                </div>

                {/* 2 & 3. First Name + Last Name (2 columns desktop, stacked mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label="First Name"
                    name="firstName"
                    value={deliveryData.firstName}
                    onChange={(e) => handleDeliveryChange("firstName", e.target.value)}
                    error={errors.firstName}
                    required
                    placeholder="e.g. Julian"
                  />
                  <FloatingInput
                    label="Last Name"
                    name="lastName"
                    value={deliveryData.lastName}
                    onChange={(e) => handleDeliveryChange("lastName", e.target.value)}
                    error={errors.lastName}
                    required
                    placeholder="e.g. Vance"
                  />
                </div>

                {/* 4. Address (Full Width) */}
                <div>
                  <FloatingInput
                    label="Address"
                    name="address"
                    value={deliveryData.address}
                    onChange={(e) => handleDeliveryChange("address", e.target.value)}
                    error={errors.address}
                    required
                    placeholder="e.g. 124 Marine Drive, Kollupitiya"
                  />
                </div>

                {/* 5 & 6. City + Postal Code (2 columns desktop, stacked mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label="City"
                    name="city"
                    value={deliveryData.city}
                    onChange={(e) => handleDeliveryChange("city", e.target.value)}
                    error={errors.city}
                    required
                    placeholder="e.g. Kinniya"
                  />
                  <FloatingInput
                    label="Postal Code"
                    name="postalCode"
                    value={deliveryData.postalCode}
                    onChange={(e) => handleDeliveryChange("postalCode", e.target.value)}
                    error={errors.postalCode}
                    required
                    placeholder="e.g. 31100"
                  />
                </div>

                {/* 7 & 8. Contact No 1 + Contact No 2 (2 columns desktop, stacked mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingPhoneInput
                    label="Contact No 1"
                    name="contactNo1"
                    value={deliveryData.contactNo1}
                    onChange={(val) => handleDeliveryChange("contactNo1", val)}
                    error={errors.contactNo1}
                    required
                    placeholder="77 123 4567"
                  />
                  <FloatingPhoneInput
                    label="Contact No 2"
                    name="contactNo2"
                    value={deliveryData.contactNo2}
                    onChange={(val) => handleDeliveryChange("contactNo2", val)}
                    error={errors.contactNo2}
                    required={false}
                    placeholder="71 987 6543"
                  />
                </div>

                {/* 9. Save this information for next time (Checkbox) */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={deliveryData.saveForNextTime}
                      onChange={(e) => handleDeliveryChange("saveForNextTime", e.target.checked)}
                      className="w-4 h-4 rounded-[3px] border-[#D9D5CF] text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-[#121212] group-hover:text-[#9B783E] transition-colors">
                      Save this information for next time
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div
              className={`bg-white border border-[#E8E5E0] p-6 sm:p-7 rounded-[2px] shadow-xs space-y-5 transition-opacity duration-300 relative ${!user ? "opacity-60 pointer-events-none select-none" : ""
                }`}
            >
              <div className="flex items-center gap-3 border-b border-[#E8E5E0] pb-4">
                <div className="w-7 h-7 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#121212]">
                    3. Payment Method
                  </h3>
                  <p className="text-[11px] text-[#66635F] mt-0.5">
                    Select your preferred payment method below
                  </p>
                </div>
              </div>

              {/* Payment Radio Options */}
              <div className="space-y-3">
                {/* Option 1: Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-start sm:items-center justify-between p-4 rounded-md border transition-all duration-200 cursor-pointer select-none ${paymentMethod === "COD"
                      ? "border-[#121212] bg-[#FAF8F5] shadow-xs ring-1 ring-[#121212]/15"
                      : "border-[#E8E5E0] bg-white hover:border-[#B8B4AE]"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="pt-0.5 sm:pt-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === "COD"
                            ? "border-[#121212]"
                            : "border-[#A8A29E]"
                          }`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="w-2 h-2 rounded-full bg-[#121212]" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-center text-[#121212] shrink-0">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#121212] block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-[#66635F]">
                          Pay in cash directly to our courier upon doorstep delivery
                        </span>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === "COD" && (
                    <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-semibold text-[#121212] bg-[#121212]/5 border border-[#121212]/15 px-2.5 py-0.5 rounded-full shrink-0">
                      Selected
                    </span>
                  )}
                </label>

                {/* Option 2: Online Bank Transfer */}
                <label
                  onClick={() => setPaymentMethod("ONLINE_TRANSFER")}
                  className={`flex items-start sm:items-center justify-between p-4 rounded-md border transition-all duration-200 cursor-pointer select-none ${paymentMethod === "ONLINE_TRANSFER"
                      ? "border-[#9B783E] bg-[#FAF4EB]/40 shadow-xs ring-1 ring-[#9B783E]/25"
                      : "border-[#E8E5E0] bg-white hover:border-[#B8B4AE]"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="pt-0.5 sm:pt-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === "ONLINE_TRANSFER"
                            ? "border-[#9B783E]"
                            : "border-[#A8A29E]"
                          }`}
                      >
                        {paymentMethod === "ONLINE_TRANSFER" && (
                          <div className="w-2 h-2 rounded-full bg-[#9B783E]" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#E8E5E0] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                        <Image
                          src="/hnb-logo.png"
                          alt="HNB Bank"
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#121212] block">
                          Online Bank Transfer (Direct Deposit)
                        </span>
                        <span className="text-[11px] text-[#66635F]">
                          Direct deposit to {bankDetails.bankName || "bank"} account with WhatsApp confirmation
                        </span>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === "ONLINE_TRANSFER" && (
                    <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-semibold text-[#9B783E] bg-[#9B783E]/15 border border-[#9B783E]/30 px-2.5 py-0.5 rounded-full shrink-0">
                      Selected
                    </span>
                  )}
                </label>
              </div>

              {/* Online Bank Transfer Details Card */}
              {paymentMethod === "ONLINE_TRANSFER" && (
                <div className="p-5 bg-white border border-[#9B783E]/40 rounded-md space-y-4 shadow-xs animate-fadeIn transition-all">
                  <div className="flex items-center justify-between border-b border-[#E8E5E0] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-5 h-5 rounded-[3px] bg-white border border-[#E8E5E0] shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                        <Building2 className="w-3.5 h-3.5 text-[#9B783E]" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
                        {bankDetails.bankName || "Bank"} Transfer Details
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#9B783E] bg-[#9B783E]/10 border border-[#9B783E]/20 px-2.5 py-0.5 rounded-full">
                      Verified Account
                    </span>
                  </div>

                  {/* All-in-One Bank Transfer Details Table */}
                  <div className="overflow-hidden rounded-[4px] border border-[#E8E5E0] bg-[#FAF8F5]">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-[#E8E5E0]">
                        <tr>
                          <th scope="row" className="w-1/3 sm:w-[35%] py-3 px-3.5 text-[10px] uppercase tracking-wider text-[#8E8B85] font-semibold bg-[#F4F1EA]/60 align-middle">
                            Bank & Branch
                          </th>
                          <td className="py-3 px-3.5 font-semibold text-[#121212] align-middle">
                            <div className="flex items-center gap-2.5">
                              <span>{bankDetails.bankName}{bankDetails.branch ? ` — ${bankDetails.branch}` : ""}</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="w-1/3 sm:w-[35%] py-3 px-3.5 text-[10px] uppercase tracking-wider text-[#8E8B85] font-semibold bg-[#F4F1EA]/60 align-middle">
                            Beneficiary
                          </th>
                          <td className="py-3 px-3.5 font-semibold text-[#121212] align-middle">
                            {bankDetails.accountName}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="w-1/3 sm:w-[35%] py-3 px-3.5 text-[10px] uppercase tracking-wider text-[#8E8B85] font-semibold bg-[#F4F1EA]/60 align-middle">
                            Account Number
                          </th>
                          <td className="py-3 px-3.5 align-middle">
                            <button
                              type="button"
                              onClick={handleCopyAccount}
                              title="Touch to copy account number"
                              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-[3px] border transition-all duration-200 cursor-pointer active:scale-95 ${
                                copiedAccount
                                  ? "bg-[#F0FDF4] border-[#2A6B46] text-[#2A6B46] shadow-xs"
                                  : "bg-white border-[#D8D4CD] hover:border-[#9B783E] text-[#121212] hover:bg-[#FAF8F5] shadow-2xs"
                              }`}
                            >
                              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider select-all">
                                {bankDetails.accountNumber}
                              </span>
                              {copiedAccount ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2A6B46]">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Copied!</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#8E8B85] group-hover:text-[#9B783E] font-medium transition-colors">
                                  (Tap to copy)
                                </span>
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-[#66635F] leading-relaxed pt-1">
                    ℹ️ After placing your order, please attach or share your deposit slip / transfer screenshot in WhatsApp for instant dispatch verification.
                  </p>
                </div>
              )}

              {/* Cash on Delivery Info Note */}
              {paymentMethod === "COD" && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E5E0] rounded-md text-xs text-[#66635F] space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-[#121212] font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#2A6B46]" />
                    <span>Cash on Delivery Confirmed</span>
                  </div>
                  <p className="text-[11px] pl-6 leading-relaxed">
                    Zero pre-payment required. Please keep the exact amount (LKR {Math.round(totalAmount).toLocaleString()}) ready when the courier arrives at your delivery destination.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Steps 4 & 5 (Order Review & Place Order) */}
          <div className="lg:col-span-5 space-y-6">
            {/* STEP 4: ORDER REVIEW */}
            <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6 rounded-[2px] shadow-xs">
              <div className="border-b border-[#E8E5E0] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center text-[11px] font-semibold">
                    4
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#121212]">
                    Order Review ({cart.reduce((acc, i) => acc + i.quantity, 0)})
                  </h3>
                </div>
                <Link
                  href="/shop"
                  className="text-[10px] text-[#9B783E] uppercase tracking-wider hover:underline"
                >
                  Edit Bag
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 pb-4 border-b border-[#F0EDE8] last:border-b-0"
                  >
                    <div className="relative w-16 h-20 bg-[#FAF8F5] shrink-0 border border-[#E8E5E0] overflow-hidden rounded-[2px]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-[#121212] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#8E8B85] mt-0.5">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>{item.color}</span>}
                      </p>
                      <p className="text-[11px] text-[#66635F] mt-1 font-medium">
                        Qty: {item.quantity} × LKR {Math.round(item.price).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#121212]">
                      LKR {(Math.round(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Live Delivery Destination Review */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E5E0] rounded-md text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#121212] font-semibold text-[11px] uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9B783E]" />
                  <span>Delivery Destination</span>
                </div>
                {deliveryData.address || deliveryData.city ? (
                  <div className="text-[11px] text-[#66635F] leading-tight space-y-0.5">
                    <p className="font-medium text-[#121212]">
                      {deliveryData.firstName} {deliveryData.lastName}
                    </p>
                    <p>{deliveryData.address}</p>
                    <p>
                      {deliveryData.city}
                      {deliveryData.postalCode ? `, ${deliveryData.postalCode}` : ""}
                    </p>
                    <p>{deliveryData.country}</p>
                    {deliveryData.contactNo1 && (
                      <p className="text-[#8E8B85] pt-0.5">+94 {deliveryData.contactNo1}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8E8B85] italic">
                    Coordinates will appear here as you complete Step 2.
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-[#E8E5E0] pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-[#66635F]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#121212]">LKR {Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#66635F]">
                  <span>{shippingLabel}</span>
                  <span className="font-medium text-[#121212]">
                    {shippingCost === 0 ? "Complimentary" : `LKR ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#66635F]">
                  <span>Payment Method</span>
                  <span className="font-medium text-[#121212]">
                    {paymentMethod === "ONLINE_TRANSFER" ? `Online Transfer (${bankDetails.bankName || "Bank"})` : "Cash on Delivery (COD)"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#121212] pt-3 border-t border-[#E8E5E0]">
                  <span>Total Due</span>
                  <span>LKR {Math.round(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* STEP 5: PLACE ORDER BUTTON */}
              <div className="pt-2 border-t border-[#E8E5E0]">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder || !user}
                  className={`w-full py-4 text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-md flex items-center justify-center gap-2.5 rounded-md ${!user
                      ? "bg-[#8E8B85] opacity-60 cursor-not-allowed"
                      : "bg-[#25D366] hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.99] cursor-pointer group"
                    }`}
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Order & Preparing WhatsApp...</span>
                    </>
                  ) : !user ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In in Step 1 to Place Order</span>
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-200" />
                      <span>5. Place Order via WhatsApp</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#8E8B85] mt-2.5">
                  🔒 SSL Encrypted • Zero pre-payment required • Confirmed with human concierge
                </p>
              </div>

              {/* Brand Guarantees */}
              <div className="pt-2 border-t border-[#F0EDE8] space-y-2 text-[11px] text-[#66635F]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6B46] shrink-0" />
                  <span>Verified Maison Tailoring & Pure Fabrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#9B783E] shrink-0" />
                  <span>Inspected & Secure Express Courier Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9B783E] shrink-0" />
                  <span>Direct Stylist Customer Care on WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
