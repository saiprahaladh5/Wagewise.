"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";
import VoiceAssistant from "./components/VoiceAssistant";
import AiInsights, {
  Transaction,
  TransactionType,
} from "./components/AiInsights";
import SpendingByCategoryChart from "./components/SpendingByCategoryChart";
import CashflowTrendChart from "./components/CashflowTrendChart";
import MonthlyIncomeExpenseChart from "./components/MonthlyIncomeExpenseChart";
import CategoryShareDonutChart from "./components/CategoryShareDonutChart";
import ChartPagination from "./components/ChartPagination";

type FormType = TransactionType;

interface FormState {
  type: FormType;
  amount: string;
  category: string;
  date: string;
  note: string;
}

type CurrencyDef = {
  code: string;
  symbol: string;
  label: string;
};

/**
 * Global currencies – built from your list.
 * (Labels are "Country – Currency (CODE)")
 */
const CURRENCIES: CurrencyDef[] = [
  // Africa
  { code: "DZD", symbol: "د.ج", label: "Algeria – Algerian dinar (DZD)" },
  { code: "AOA", symbol: "Kz", label: "Angola – Kwanza (AOA)" },
  { code: "XOF", symbol: "CFA", label: "Benin – West African CFA franc (XOF)" },
  { code: "BWP", symbol: "P", label: "Botswana – Pula (BWP)" },
  { code: "XOF", symbol: "CFA", label: "Burkina Faso – West African CFA franc (XOF)" },
  { code: "BIF", symbol: "FBu", label: "Burundi – Burundian franc (BIF)" },
  { code: "CVE", symbol: "Esc", label: "Cabo Verde – Cabo Verdean escudo (CVE)" },
  { code: "XAF", symbol: "CFA", label: "Cameroon – Central African CFA franc (XAF)" },
  { code: "XAF", symbol: "CFA", label: "Central African Republic – Central African CFA franc (XAF)" },
  { code: "XAF", symbol: "CFA", label: "Chad – Central African CFA franc (XAF)" },
  { code: "KMF", symbol: "CF", label: "Comoros – Comorian franc (KMF)" },
  { code: "XAF", symbol: "CFA", label: "Congo (Republic) – Central African CFA franc (XAF)" },
  { code: "CDF", symbol: "FC", label: "Congo (DRC) – Congolese franc (CDF)" },
  { code: "XOF", symbol: "CFA", label: "Côte d’Ivoire – West African CFA franc (XOF)" },
  { code: "DJF", symbol: "Fdj", label: "Djibouti – Djiboutian franc (DJF)" },
  { code: "EGP", symbol: "£", label: "Egypt – Egyptian pound (EGP)" },
  { code: "XAF", symbol: "CFA", label: "Equatorial Guinea – Central African CFA franc (XAF)" },
  { code: "ERN", symbol: "Nfk", label: "Eritrea – Nakfa (ERN)" },
  { code: "SZL", symbol: "L", label: "Eswatini – Lilangeni (SZL)" },
  { code: "ETB", symbol: "Br", label: "Ethiopia – Birr (ETB)" },
  { code: "XAF", symbol: "CFA", label: "Gabon – Central African CFA franc (XAF)" },
  { code: "GMD", symbol: "D", label: "Gambia – Dalasi (GMD)" },
  { code: "GHS", symbol: "₵", label: "Ghana – Ghanaian cedi (GHS)" },
  { code: "GNF", symbol: "FG", label: "Guinea – Guinean franc (GNF)" },
  { code: "XOF", symbol: "CFA", label: "Guinea-Bissau – West African CFA franc (XOF)" },
  { code: "KES", symbol: "Ksh", label: "Kenya – Kenyan shilling (KES)" },
  { code: "LSL", symbol: "L", label: "Lesotho – Loti (LSL)" },
  { code: "LRD", symbol: "$", label: "Liberia – Liberian dollar (LRD)" },
  { code: "LYD", symbol: "ل.د", label: "Libya – Libyan dinar (LYD)" },
  { code: "MGA", symbol: "Ar", label: "Madagascar – Malagasy ariary (MGA)" },
  { code: "MWK", symbol: "MK", label: "Malawi – Malawian kwacha (MWK)" },
  { code: "XOF", symbol: "CFA", label: "Mali – West African CFA franc (XOF)" },
  { code: "MRU", symbol: "UM", label: "Mauritania – Ouguiya (MRU)" },
  { code: "MUR", symbol: "₨", label: "Mauritius – Mauritian rupee (MUR)" },
  { code: "MAD", symbol: "د.م", label: "Morocco – Moroccan dirham (MAD)" },
  { code: "MZN", symbol: "MT", label: "Mozambique – Metical (MZN)" },
  { code: "NAD", symbol: "$", label: "Namibia – Namibian dollar (NAD)" },
  { code: "XOF", symbol: "CFA", label: "Niger – West African CFA franc (XOF)" },
  { code: "NGN", symbol: "₦", label: "Nigeria – Naira (NGN)" },
  { code: "RWF", symbol: "FRw", label: "Rwanda – Rwandan franc (RWF)" },
  { code: "STN", symbol: "Db", label: "São Tomé and Príncipe – Dobra (STN)" },
  { code: "XOF", symbol: "CFA", label: "Senegal – West African CFA franc (XOF)" },
  { code: "SCR", symbol: "₨", label: "Seychelles – Seychelles rupee (SCR)" },
  { code: "SLE", symbol: "Le", label: "Sierra Leone – Leone (SLE)" },
  { code: "SOS", symbol: "Sh", label: "Somalia – Somali shilling (SOS)" },
  { code: "ZAR", symbol: "R", label: "South Africa – Rand (ZAR)" },
  { code: "SSP", symbol: "£", label: "South Sudan – South Sudanese pound (SSP)" },
  { code: "SDG", symbol: "£", label: "Sudan – Sudanese pound (SDG)" },
  { code: "TZS", symbol: "Sh", label: "Tanzania – Tanzanian shilling (TZS)" },
  { code: "XOF", symbol: "CFA", label: "Togo – West African CFA franc (XOF)" },
  { code: "TND", symbol: "د.ت", label: "Tunisia – Tunisian dinar (TND)" },
  { code: "UGX", symbol: "USh", label: "Uganda – Ugandan shilling (UGX)" },
  { code: "ZMW", symbol: "ZK", label: "Zambia – Zambian kwacha (ZMW)" },
  { code: "ZWL", symbol: "Z$", label: "Zimbabwe – Zimbabwean dollar (ZWL)" },

  // Americas & Caribbean
  { code: "XCD", symbol: "$", label: "East Caribbean dollar (XCD)" },
  { code: "ARS", symbol: "$", label: "Argentina – Argentine peso (ARS)" },
  { code: "BSD", symbol: "$", label: "Bahamas – Bahamian dollar (BSD)" },
  { code: "BBD", symbol: "Bds$", label: "Barbados – Barbadian dollar (BBD)" },
  { code: "BZD", symbol: "BZ$", label: "Belize – Belize dollar (BZD)" },
  { code: "BOB", symbol: "Bs", label: "Bolivia – Boliviano (BOB)" },
  { code: "BRL", symbol: "R$", label: "Brazil – Brazilian real (BRL)" },
  { code: "CAD", symbol: "C$", label: "Canada – Canadian dollar (CAD)" },
  { code: "CLP", symbol: "$", label: "Chile – Chilean peso (CLP)" },
  { code: "COP", symbol: "$", label: "Colombia – Colombian peso (COP)" },
  { code: "CRC", symbol: "₡", label: "Costa Rica – Costa Rican colón (CRC)" },
  { code: "CUP", symbol: "$", label: "Cuba – Cuban peso (CUP)" },
  { code: "DOP", symbol: "RD$", label: "Dominican Republic – Dominican peso (DOP)" },
  { code: "USD", symbol: "$", label: "US dollar (USD)" },
  { code: "GTQ", symbol: "Q", label: "Guatemala – Quetzal (GTQ)" },
  { code: "GYD", symbol: "$", label: "Guyana – Guyanese dollar (GYD)" },
  { code: "HTG", symbol: "G", label: "Haiti – Gourde (HTG)" },
  { code: "HNL", symbol: "L", label: "Honduras – Lempira (HNL)" },
  { code: "JMD", symbol: "J$", label: "Jamaica – Jamaican dollar (JMD)" },
  { code: "MXN", symbol: "$", label: "Mexico – Mexican peso (MXN)" },
  { code: "NIO", symbol: "C$", label: "Nicaragua – Córdoba (NIO)" },
  { code: "PAB", symbol: "B/.", label: "Panama – Balboa (PAB)" },
  { code: "PYG", symbol: "₲", label: "Paraguay – Guaraní (PYG)" },
  { code: "PEN", symbol: "S/.", label: "Peru – Sol (PEN)" },
  { code: "SRD", symbol: "$", label: "Suriname – Surinamese dollar (SRD)" },
  { code: "TTD", symbol: "TT$", label: "Trinidad and Tobago – Dollar (TTD)" },
  { code: "UYU", symbol: "$U", label: "Uruguay – Uruguayan peso (UYU)" },
  { code: "VES", symbol: "Bs", label: "Venezuela – Bolívar (VES)" },

  // Asia
  { code: "AFN", symbol: "؋", label: "Afghanistan – Afghani (AFN)" },
  { code: "AMD", symbol: "֏", label: "Armenia – Dram (AMD)" },
  { code: "AZN", symbol: "₼", label: "Azerbaijan – Manat (AZN)" },
  { code: "BHD", symbol: "ب.د", label: "Bahrain – Bahraini dinar (BHD)" },
  { code: "BDT", symbol: "৳", label: "Bangladesh – Taka (BDT)" },
  { code: "BTN", symbol: "Nu.", label: "Bhutan – Ngultrum (BTN)" },
  { code: "BND", symbol: "B$", label: "Brunei – Brunei dollar (BND)" },
  { code: "KHR", symbol: "៛", label: "Cambodia – Riel (KHR)" },
  { code: "CNY", symbol: "¥", label: "China – Renminbi yuan (CNY)" },
  { code: "GEL", symbol: "₾", label: "Georgia – Lari (GEL)" },
  { code: "INR", symbol: "₹", label: "India – Indian rupee (INR)" },
  { code: "IDR", symbol: "Rp", label: "Indonesia – Rupiah (IDR)" },
  { code: "IRR", symbol: "﷼", label: "Iran – Iranian rial (IRR)" },
  { code: "IQD", symbol: "ع.د", label: "Iraq – Iraqi dinar (IQD)" },
  { code: "ILS", symbol: "₪", label: "Israel – New shekel (ILS)" },
  { code: "JPY", symbol: "¥", label: "Japan – Yen (JPY)" },
  { code: "JOD", symbol: "د.أ", label: "Jordan – Jordanian dinar (JOD)" },
  { code: "KZT", symbol: "₸", label: "Kazakhstan – Tenge (KZT)" },
  { code: "KWD", symbol: "د.ك", label: "Kuwait – Kuwaiti dinar (KWD)" },
  { code: "KGS", symbol: "с", label: "Kyrgyzstan – Som (KGS)" },
  { code: "LAK", symbol: "₭", label: "Laos – Kip (LAK)" },
  { code: "LBP", symbol: "ل.ل", label: "Lebanon – Lebanese pound (LBP)" },
  { code: "MYR", symbol: "RM", label: "Malaysia – Ringgit (MYR)" },
  { code: "MVR", symbol: "Rf", label: "Maldives – Rufiyaa (MVR)" },
  { code: "MNT", symbol: "₮", label: "Mongolia – Tögrög (MNT)" },
  { code: "MMK", symbol: "K", label: "Myanmar – Kyat (MMK)" },
  { code: "NPR", symbol: "₨", label: "Nepal – Nepalese rupee (NPR)" },
  { code: "KPW", symbol: "₩", label: "North Korea – Won (KPW)" },
  { code: "OMR", symbol: "ر.ع", label: "Oman – Omani rial (OMR)" },
  { code: "PKR", symbol: "₨", label: "Pakistan – Pakistani rupee (PKR)" },
  { code: "PHP", symbol: "₱", label: "Philippines – Peso (PHP)" },
  { code: "QAR", symbol: "ر.ق", label: "Qatar – Qatari riyal (QAR)" },
  { code: "SAR", symbol: "ر.س", label: "Saudi Arabia – Riyal (SAR)" },
  { code: "SGD", symbol: "S$", label: "Singapore – Singapore dollar (SGD)" },
  { code: "KRW", symbol: "₩", label: "South Korea – Won (KRW)" },
  { code: "LKR", symbol: "රු", label: "Sri Lanka – Rupee (LKR)" },
  { code: "SYP", symbol: "£", label: "Syria – Syrian pound (SYP)" },
  { code: "TWD", symbol: "NT$", label: "Taiwan – New Taiwan dollar (TWD)" },
  { code: "TJS", symbol: "SM", label: "Tajikistan – Somoni (TJS)" },
  { code: "THB", symbol: "฿", label: "Thailand – Baht (THB)" },
  { code: "TRY", symbol: "₺", label: "Turkey – Turkish lira (TRY)" },
  { code: "TMT", symbol: "m", label: "Turkmenistan – Manat (TMT)" },
  { code: "AED", symbol: "د.إ", label: "UAE – Dirham (AED)" },
  { code: "UZS", symbol: "so'm", label: "Uzbekistan – Soʻm (UZS)" },
  { code: "VND", symbol: "₫", label: "Vietnam – Đồng (VND)" },
  { code: "YER", symbol: "﷼", label: "Yemen – Rial (YER)" },

  // Europe
  { code: "EUR", symbol: "€", label: "Eurozone – Euro (EUR)" },
  { code: "ALL", symbol: "L", label: "Albania – Lek (ALL)" },
  { code: "BYN", symbol: "Br", label: "Belarus – Belarusian ruble (BYN)" },
  { code: "BAM", symbol: "KM", label: "Bosnia and Herzegovina – Convertible mark (BAM)" },
  { code: "BGN", symbol: "лв", label: "Bulgaria – Lev (BGN)" },
  { code: "CZK", symbol: "Kč", label: "Czech Republic – Koruna (CZK)" },
  { code: "DKK", symbol: "kr", label: "Denmark – Krone (DKK)" },
  { code: "HUF", symbol: "Ft", label: "Hungary – Forint (HUF)" },
  { code: "ISK", symbol: "kr", label: "Iceland – Króna (ISK)" },
  { code: "MDL", symbol: "L", label: "Moldova – Leu (MDL)" },
  { code: "MKD", symbol: "ден", label: "North Macedonia – Denar (MKD)" },
  { code: "NOK", symbol: "kr", label: "Norway – Krone (NOK)" },
  { code: "PLN", symbol: "zł", label: "Poland – Złoty (PLN)" },
  { code: "RON", symbol: "lei", label: "Romania – Leu (RON)" },
  { code: "RUB", symbol: "₽", label: "Russia – Ruble (RUB)" },
  { code: "RSD", symbol: "дин.", label: "Serbia – Serbian dinar (RSD)" },
  { code: "SEK", symbol: "kr", label: "Sweden – Krona (SEK)" },
  { code: "CHF", symbol: "Fr", label: "Switzerland – Swiss franc (CHF)" },
  { code: "UAH", symbol: "₴", label: "Ukraine – Hryvnia (UAH)" },
  { code: "GBP", symbol: "£", label: "United Kingdom – Pound sterling (GBP)" },

  // Oceania & Pacific
  { code: "AUD", symbol: "A$", label: "Australia – Australian dollar (AUD)" },
  { code: "FJD", symbol: "$", label: "Fiji – Fiji dollar (FJD)" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand – New Zealand dollar (NZD)" },
  { code: "PGK", symbol: "K", label: "Papua New Guinea – Kina (PGK)" },
  { code: "SBD", symbol: "$", label: "Solomon Islands – Dollar (SBD)" },
  { code: "WST", symbol: "T", label: "Samoa – Tala (WST)" },
  { code: "TOP", symbol: "T$", label: "Tonga – Paʻanga (TOP)" },
  { code: "VUV", symbol: "Vt", label: "Vanuatu – Vatu (VUV)" },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [, setSpokenLog] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [form, setForm] = useState<FormState>({
    type: "income",
    amount: "",
    category: "",
    date: todayStr,
    note: "",
  });

  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0],
    [currencyCode]
  );

  const [monthlyBudget, setMonthlyBudget] = useState<number>(1000);

  // 👉 Check auth on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // Suppress "AuthSessionMissingError" which just means no session found
        if (error && error.name !== "AuthSessionMissingError" && error.message !== "Auth session missing!") {
          console.error("Error getting user or missing session:", error);
        }
        setUser(null);
        setAuthChecked(true);
        router.replace("/login?reason=expired");
        return;
      }
      setUser(data.user);
      setAuthChecked(true);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthChecked(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 👉 Load transactions when user available
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setTransactions([]);
        return;
      }
      setLoadingTx(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading transactions:", error.message ?? error);
        alert(`Error loading transactions: ${error.message ?? "Unknown error"}`);
        setTransactions([]);
      } else if (data) {
        const mapped: Transaction[] = data.map((row: {
          id: number | string;
          type: string;
          amount: number | string;
          category: string;
          date: string;
          note: string | null;
          currency_code?: string;
        }) => ({
          id: String(row.id), // Keep as string, don't convert to number
          type: row.type as TransactionType,
          amount: Number(row.amount),
          category: row.category,
          date: row.date,
          note: row.note ?? null,
          currency_code: row.currency_code ?? "USD",
        }));
        setTransactions(mapped);
      }
      setLoadingTx(false);
    };

    fetchTransactions();
  }, [user]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const monthlySummary = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { income: 0, expense: 0, net: 0 };
    }

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - 30);

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      const d = new Date(t.date);
      if (d < cutoff || d > now) continue;

      if (t.type === "income") {
        income += t.amount;
      } else if (t.type === "expense") {
        expense += t.amount;
      }
    }

    return {
      income,
      expense,
      net: income - expense,
    };
  }, [transactions]);

  const remainingBudget = useMemo(() => {
    if (!monthlyBudget || monthlyBudget <= 0) return null;
    const used = monthlySummary.expense;
    return {
      used,
      left: monthlyBudget - used,
      percentUsed: Math.min(100, (used / monthlyBudget) * 100),
    };
  }, [monthlyBudget, monthlySummary.expense]);

  const handleChange = (
    field: keyof FormState,
    value: string | FormType
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  type CreateTxInput = {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
    currency_code: string;
  };

  const createTransaction = async (input: CreateTxInput): Promise<Transaction> => {
    if (!user) {
      throw new Error("Please log in.");
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: input.type,
        amount: input.amount,
        category: input.category,
        date: input.date || todayStr,
        note: input.note ?? null,
        currency_code: input.currency_code,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting transaction:", error);
      throw error;
    }

    return {
      id: String(data.id), // Keep as string, don't convert to number
      type: data.type as TransactionType,
      amount: Number(data.amount),
      category: data.category,
      date: data.date,
      note: data.note ?? null,
      currency_code: data.currency_code ?? "USD",
    };
  };

  const handleAdd = async () => {
    if (!user) {
      alert("Please log in to add transactions.");
      return;
    }

    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!form.category.trim()) {
      alert("Please enter a category.");
      return;
    }

    try {
      const newTx = await createTransaction({
        type: form.type,
        amount: amountNum,
        category: form.category.trim(),
        date: form.date || todayStr,
        note: form.note.trim() || null,
        currency_code: currencyCode,
      });

      setTransactions((prev) => [newTx, ...prev]);
      setForm((prev) => ({
        ...prev,
        amount: "",
        category: "",
        note: "",
      }));
    } catch {
      alert("Could not save transaction. Try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      alert("Please log in.");
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting transaction:", error);
      alert("Could not delete. Try again.");
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyCode(e.target.value);
  };

  // Aliases for the new return statement
  const monthlyIncome = monthlySummary.income;
  const monthlyExpenses = monthlySummary.expense;
  const monthlyNet = monthlySummary.net;
  const budget = monthlyBudget;
  const setBudget = setMonthlyBudget;
  const budgetUsedPercent = remainingBudget
    ? remainingBudget.percentUsed
    : 0;

  // 🔊 Voice handler – ADD or DELETE/TRUNCATE transactions (with DB)
  const handleVoiceText = async (spoken: string) => {
    setSpokenLog(spoken);
    console.log("Voice input:", spoken);

    if (!user) {
      console.log("No user logged in; ignoring voice command.");
      return;
    }

    const text = spoken.toLowerCase();

    // 1) Extract number (supports 5,000 / 10,000 / 5000 / 69.00)
    const amountMatch = text.match(/(\d[\d,]*(?:\.\d+)?)/);
    const amount = amountMatch
      ? Number(amountMatch[1].replace(/,/g, ""))
      : null;

    // 2) Map keywords -> category
    const catMap: { [key: string]: string } = {
      food: "Food",
      pizza: "Food",
      restaurant: "Food",
      coffee: "Coffee",
      starbucks: "Coffee",
      fuel: "Fuel",
      gas: "Fuel",
      petrol: "Fuel",
      rent: "Rent",
      room: "Rent",
      uber: "Transport",
      taxi: "Transport",
      bus: "Transport",
      bag: "Shopping",
      clothes: "Shopping",
      shopping: "Shopping",
      beauty: "Beauty",
      salon: "Beauty",
      income: "Income",
      salary: "Income",
      wage: "Income",
      wages: "Income",
    };

    let category = "Voice";
    for (const key of Object.keys(catMap)) {
      if (text.includes(key)) {
        category = catMap[key];
        break;
      }
    }

    // 3) Check if it's a DELETE / TRUNCATE style command
    const isDeleteCommand = ["delete", "remove", "truncate", "cancel"].some(
      (word) => text.includes(word)
    );

    if (isDeleteCommand) {
      if (transactions.length === 0) {
        console.log("No transactions to delete.");
        return;
      }

      const catLower = category.toLowerCase();
      let txToDelete: Transaction | null = null;

      for (const t of transactions) {
        const amountOk = amount
          ? Math.round(t.amount) === Math.round(amount)
          : true;

        const tCat = t.category.toLowerCase();
        const categoryOk =
          category !== "Voice"
            ? tCat === catLower || text.includes(tCat)
            : true;

        if (amountOk && categoryOk) {
          txToDelete = t;
          break;
        }
      }

      if (!txToDelete) {
        console.log(
          "Voice delete: could not find a matching transaction to delete."
        );
        return;
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", txToDelete.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Voice delete DB error:", error);
        return;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== txToDelete!.id));
      return;
    }

    // 4) Otherwise treat as ADD transaction

    let type: TransactionType = "expense";
    if (
      text.includes("salary") ||
      text.includes("income") ||
      text.includes("got paid") ||
      text.includes("received") ||
      text.includes("wage")
    ) {
      type = "income";
    }

    if (!amount || amount <= 0) {
      console.log("Could not find a valid amount in voice text:", spoken);
      return;
    }

    const payload = {
      type,
      amount,
      category,
      date: todayStr,
      note: spoken,
      currency_code: currencyCode,
    };

    try {
      const newTx = await createTransaction(payload);
      setTransactions((prev) => [newTx, ...prev]);
    } catch (error) {
      console.error("Voice insert error:", error);
    }
  };

  const handleVoiceAI = async (question: string): Promise<string> => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - 30);

    let monthInc = 0, monthExp = 0, txnCount = 0;
    const catTotals = new Map<string, number>();

    for (const t of transactions) {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === "income") monthInc += t.amount;
        else monthExp += t.amount;
      }
      if (d >= cutoff && d <= now) {
        txnCount++;
        if (t.type === "expense") {
          catTotals.set(t.category, (catTotals.get(t.category) ?? 0) + t.amount);
        }
      }
    }

    const topCats = Array.from(catTotals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        stats: {
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
          monthIncome: monthInc,
          monthExpense: monthExp,
          monthNet: monthInc - monthExp,
          last30DaysTxnCount: txnCount,
          topCategories: topCats,
        },
      }),
    });

    if (!res.ok) throw new Error("AI request failed");
    const data = (await res.json()) as { answer?: string; error?: string };
    if (data.error) throw new Error(data.error);
    return data.answer ?? "I had trouble generating a response.";
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const premiumCardStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, #0c1220 0%, #111a2e 50%, #0c1220 100%)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 40px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)",
  };

  const shimmerTextStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #e2e8f0 0%, #06b6d4 35%, #8b5cf6 65%, #e2e8f0 100%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "shimmer 4s ease-in-out infinite",
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d19]">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Checking session...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d19]">
        <div className="mx-4 w-full max-w-sm rounded-2xl p-8 text-center" style={premiumCardStyle}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/25">
            <span className="text-xl font-black text-white">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">WageWise</h1>
          <p className="text-xs text-slate-400 mb-6">
            AI-powered money coach for people with irregular income.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <motion.main
      className="relative min-h-screen bg-[#080d19] text-slate-200 overflow-hidden"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-cyan-500/[0.07] blur-[150px]" />
        <div className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-violet-500/[0.08] blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-500/[0.06] blur-[150px]" />
        <div className="absolute top-2/3 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/[0.05] blur-[100px]" />
      </div>

      <motion.div
        className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 lg:px-0"
        variants={staggerContainer}
      >
        {/* TOP NAV */}
        <motion.header className="flex flex-col gap-3 rounded-2xl px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between lg:px-6" style={premiumCardStyle} variants={fadeUp}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/30 ring-1 ring-white/10">
              <span className="text-lg font-black text-white">W</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">WageWise</p>
              <p className="text-[11px] text-slate-400">AI money coach for irregular income</p>
            </div>
            <span className="ml-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 ring-1 ring-cyan-400/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">Live</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0b1120] px-3 py-2 text-xs">
              <span className="text-[11px] font-medium text-slate-500">USD</span>
              <select value={currency.code} onChange={handleCurrencyChange} className="bg-transparent text-xs font-medium text-slate-300 outline-none">
                {CURRENCIES.map((c) => (<option key={`${c.code}-${c.label}`} value={c.code} className="bg-[#1a2235] text-slate-200">{c.label}</option>))}
              </select>
            </div>
            {user && (
              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0b1120] px-3 py-2 text-xs">
                <span className="hidden max-w-[160px] truncate text-slate-400 sm:inline">{user.email}</span>
                <button onClick={handleLogout} className="rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:brightness-110 active:scale-[0.97]">Log out</button>
              </div>
            )}
          </div>
        </motion.header>

        {/* SUMMARY CARDS */}
        <motion.section className="grid gap-4 md:grid-cols-3" variants={fadeUp}>
          <div className="group rounded-2xl px-5 py-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] border-t-2 border-t-amber-500/40" style={premiumCardStyle}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Last 30 days &ndash; income</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">{currency.symbol}{monthlyIncome.toFixed(0)}</p>
            <p className="mt-1 text-xs text-slate-500">Money coming in</p>
          </div>
          <div className="group rounded-2xl px-5 py-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,63,94,0.12)] border-t-2 border-t-rose-500/40" style={premiumCardStyle}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Last 30 days &ndash; expenses</p>
            <p className="mt-1 text-3xl font-bold text-rose-400">{currency.symbol}{monthlyExpenses.toFixed(0)}</p>
            <p className="mt-1 text-xs text-slate-500">Money going out</p>
          </div>
          <div className="group rounded-2xl px-5 py-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)] border-t-2 border-t-cyan-500/40" style={premiumCardStyle}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Net balance</p>
            <p className={`mt-1 text-3xl font-bold ${monthlyNet >= 0 ? "text-cyan-400" : "text-rose-400"}`}>{monthlyNet >= 0 ? "+" : ""}{currency.symbol}{monthlyNet.toFixed(0)}</p>
            <p className="mt-1 text-xs text-slate-500">Last 30 days</p>
          </div>
        </motion.section>

        {/* BUDGET */}
        <motion.section className="rounded-2xl px-5 py-5" style={premiumCardStyle} variants={fadeUp}>
          <div className="mb-3 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-base font-bold text-white">Monthly expense budget</h3>
              <p className="mt-1 text-sm text-slate-400">Total budget: <span className="font-semibold text-white">{currency.symbol}{budget.toFixed(0)}</span> &bull; Used: <span className="font-semibold text-amber-400">{currency.symbol}{monthlyExpenses.toFixed(0)} ({budgetUsedPercent.toFixed(0)}%)</span> &bull; Remaining: <span className="font-semibold text-emerald-400">{currency.symbol}{Math.max(budget - monthlyExpenses, 0).toFixed(0)}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Budget:</span>
              <input type="number" min={0} value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} className="w-24 rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2 text-right text-sm text-white outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" />
            </div>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#0b1120]">
            <div className={`h-full rounded-full transition-all duration-500 ${budgetUsedPercent > 90 ? "bg-gradient-to-r from-amber-400 to-rose-500" : "bg-gradient-to-r from-emerald-400 to-cyan-400"}`} style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }} />
          </div>
        </motion.section>

        {/* CHARTS */}
        <motion.section variants={fadeUp}>
          <ChartPagination
            tabs={[
              {
                id: "spending",
                label: "Spending by Category",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                content: <SpendingByCategoryChart transactions={transactions} currencySymbol={currency.symbol} />,
              },
              {
                id: "cashflow",
                label: "Cashflow Trend",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
                content: <CashflowTrendChart transactions={transactions} currencySymbol={currency.symbol} />,
              },
              {
                id: "monthly",
                label: "Income vs Expenses",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
                content: <MonthlyIncomeExpenseChart transactions={transactions} currencySymbol={currency.symbol} />,
              },
              {
                id: "donut",
                label: "Expense Share",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
                content: <CategoryShareDonutChart transactions={transactions} currencySymbol={currency.symbol} />,
              },
            ]}
          />
        </motion.section>

        {/* ADD TRANSACTION */}
        <motion.section className="rounded-2xl p-5" style={premiumCardStyle} variants={fadeUp}>
          <h3 className="mb-4 text-base font-bold text-white">Add transaction</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1.5 block text-xs font-medium text-slate-400">Type</label><select value={form.type} onChange={(e) => handleChange("type", e.target.value as FormType)} className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"><option value="income">Income</option><option value="expense">Expense</option></select></div>
              <div><label className="mb-1.5 block text-xs font-medium text-slate-400">Amount</label><div className="flex items-center rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20"><span className="mr-1 text-slate-500">{currency.symbol}</span><input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} className="w-full bg-transparent text-white outline-none placeholder:text-slate-600" placeholder="0.00" /></div></div>
            </div>
            <div><label className="mb-1.5 block text-xs font-medium text-slate-400">Category</label><input type="text" value={form.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="e.g., Food, Rent, Freelance" className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-slate-400">Date</label><input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-slate-400">Note</label><input type="text" value={form.note ?? ""} onChange={(e) => handleChange("note", e.target.value)} placeholder="Optional description" className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /></div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-[0.98]">+ Add</button>
          </form>
        </motion.section>

        {/* VOICE ASSISTANT */}
        <motion.section className="rounded-2xl p-5 border-l-2 border-l-violet-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]" style={premiumCardStyle} variants={fadeUp}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              Voice assistant
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400 ring-1 ring-violet-400/30">AI Powered</span>
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Speaks back
            </div>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Ask questions like &quot;How much did I spend on food?&quot; or give commands like &quot;Add 500 income from salary&quot;
          </p>
          <VoiceAssistant onTextFinal={handleVoiceText} onAskAI={handleVoiceAI} />
        </motion.section>

        {/* AI COACH */}
        <motion.section className="rounded-2xl p-5 border-l-2 border-l-cyan-500/50" style={{...premiumCardStyle, boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 40px rgba(0,0,0,0.5), 0 0 30px rgba(6,182,212,0.06)"}} variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold" style={shimmerTextStyle}>WageWise AI Coach</h3>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-400/30">AI Powered</span>
          </div>
          <AiInsights transactions={transactions} currency={currency} />
        </motion.section>

        {/* TRANSACTIONS TABLE */}
        <motion.section className="rounded-2xl p-5 text-sm" style={premiumCardStyle} variants={fadeUp}>
          <h3 className="mb-4 text-base font-bold text-white">Recent transactions</h3>
          {loadingTx ? (
            <div className="flex items-center gap-2 py-8 text-xs text-slate-500"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Loading your data...</div>
          ) : transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-[#0b1120] py-10 text-center"><p className="text-xs text-slate-500">No transactions yet. Add your first one above or use voice.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Note</th>
                    <th className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, index) => (
                    <tr key={String(t.id ?? index)} className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]">
                      <td className="py-3 pr-3 text-slate-400">{t.date}</td>
                      <td className="py-3 pr-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.type === "income" ? "bg-amber-500/15 text-amber-400" : "bg-rose-500/15 text-rose-400"}`}>{t.type}</span></td>
                      <td className="py-3 pr-3 font-medium text-slate-300">{t.category}</td>
                      <td className="py-3 pr-3"><span className={`font-semibold ${t.type === "income" ? "text-amber-400" : "text-rose-400"}`}>{t.type === "income" ? "+" : "-"}{currency.symbol}{t.amount.toFixed(2)}</span></td>
                      <td className="py-3 pr-3 text-slate-500">{t.note ?? "-"}</td>
                      <td className="py-3 pr-3"><button onClick={() => handleDelete(t.id)} className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      </motion.div>
    </motion.main>
  );
}
