"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabaseClient";
import VoiceAssistant from "./components/VoiceAssistant";
import AiInsights, {
  Transaction,
  TransactionType,
} from "./components/AiInsights";
import SpendingByCategoryChart from "./components/SpendingByCategoryChart";
import CashflowTrendChart from "./components/CashflowTrendChart";
import MonthlyIncomeExpenseChart from "./components/MonthlyIncomeExpenseChart";
import CategoryShareDonutChart from "./components/CategoryShareDonutChart";

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
  const [spokenLog, setSpokenLog] = useState<string | null>(null);

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
      return {
        income: 0,
        expense: 0,
        net: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      // t.date is string like "2025-01-06"
      const d = new Date(t.date);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
        continue;
      }

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
    const used = totals.expense;
    return {
      used,
      left: monthlyBudget - used,
      percentUsed: Math.min(100, (used / monthlyBudget) * 100),
    };
  }, [monthlyBudget, totals.expense]);

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

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-300">Checking session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-slate-900/80 p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">WageWise</h1>
          <p className="text-xs text-slate-400 mb-4">
            AI-powered money coach for people with irregular income.
          </p>
          <p className="text-xs text-slate-300 mb-4">
            Please create an account or log in to start tracking your wages and expenses.
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-600 py-2 font-semibold text-slate-100 hover:bg-slate-800"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Glowing background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-40 right-0 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:px-0">
        {/* ===== TOP NAV / BRAND BAR ===== */}
        <header className="flex flex-col gap-3 rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/95 px-4 py-3 shadow-[0_0_70px_rgba(56,189,248,0.35)] lg:flex-row lg:items-center lg:justify-between lg:px-6">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-sky-400 to-fuchsia-500 shadow-lg shadow-emerald-500/50">
              <span className="text-lg font-black text-slate-950">W</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-50">WageWise</p>
              <p className="text-xs text-slate-300">
                AI money coach for people with irregular income
              </p>
            </div>
            <span className="ml-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300 ring-1 ring-emerald-400/50">
              Live dashboard
            </span>
          </div>

          {/* Right side: currency + user */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency pill */}
            <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-slate-700/80">
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                Currency
              </span>
              <select
                value={currency.code}
                onChange={handleCurrencyChange}
                className="bg-transparent text-xs outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option
                    key={`${c.code}-${c.label}`}
                    value={c.code}
                    className="bg-slate-900 text-slate-100"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User + logout */}
            {user && (
              <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-slate-700/80">
                <span className="hidden max-w-[160px] truncate sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-3 py-1 text-xs font-semibold text-slate-950 shadow-md shadow-rose-500/40 hover:brightness-110 active:translate-y-[1px]"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ===== SUMMARY CARDS ===== */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Income */}
          <div className="rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-slate-900/95 to-slate-950/90 px-5 py-4 shadow-[0_20px_60px_rgba(16,185,129,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
              This month – income
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {currency.symbol}
              {monthlyIncome.toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-emerald-200/80">Money coming in</p>
          </div>

          {/* Expenses */}
          <div className="rounded-3xl border border-rose-400/45 bg-gradient-to-br from-rose-500/10 via-slate-900/95 to-slate-950/90 px-5 py-4 shadow-[0_20px_60px_rgba(244,63,94,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200/90">
              This month – expenses
            </p>
            <p className="mt-2 text-3xl font-bold text-rose-400">
              {currency.symbol}
              {monthlyExpenses.toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-rose-200/80">Money going out</p>
          </div>

          {/* Net */}
          <div className="rounded-3xl border border-sky-400/45 bg-gradient-to-br from-sky-500/10 via-slate-900/95 to-slate-950/90 px-5 py-4 shadow-[0_20px_60px_rgba(56,189,248,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">
              This month – net
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${monthlyNet >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
            >
              {currency.symbol}
              {monthlyNet.toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-sky-200/80">
              {monthlyNet >= 0 ? "You're in the green" : "You're in the red"}
            </p>
          </div>
        </section>

        {/* ===== BUDGET BAR ===== */}
        <section className="rounded-3xl border border-slate-800/90 bg-slate-900/90 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
          <div className="mb-3 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Monthly expense budget
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {currency.symbol}
                {budget.toFixed(0)} total · Used{" "}
                <span className="font-semibold text-emerald-300">
                  {currency.symbol}
                  {monthlyExpenses.toFixed(0)} ({budgetUsedPercent.toFixed(0)}%)
                </span>{" "}
                · Left{" "}
                <span className="font-semibold text-sky-300">
                  {currency.symbol}
                  {Math.max(budget - monthlyExpenses, 0).toFixed(0)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Set budget</span>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                className="w-24 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-right text-xs text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
              />
            </div>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-400"
              style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
            />
          </div>
        </section>

        {/* ===== CHARTS ROW ===== */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Spending by category */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Spending by category
                </h2>
                <p className="text-xs text-slate-400">
                  Last 30 days of expenses, grouped by where your money went.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                {currency.symbol} totals
              </span>
            </div>
            <div className="mt-2 h-64">
              <SpendingByCategoryChart
                transactions={transactions}
                currencySymbol={currency.symbol}
              />
            </div>
          </div>

          {/* Cashflow trend chart */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Cashflow trend (last 30 days)
                </h2>
                <p className="text-xs text-slate-400">
                  Daily view of income vs expenses so you can spot spikes.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                {currency.symbol} / day
              </span>
            </div>
            <div className="mt-2 h-64">
              <CashflowTrendChart
                transactions={transactions}
                currencySymbol={currency.symbol}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <MonthlyIncomeExpenseChart
              transactions={transactions}
              currencySymbol={currency.symbol}
            />
          </div>
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <CategoryShareDonutChart
              transactions={transactions}
              currencySymbol={currency.symbol}
            />
          </div>
        </section>

        {/* Add transaction + Voice assistant */}
        <section className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
          {/* Add transaction */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Add transaction
                </h2>
                <p className="text-xs text-slate-400">
                  Track income and expenses in a few seconds.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
            >
              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    handleChange("type", e.target.value as FormType)
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Amount</label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/70">
                  <span className="mr-1 text-slate-500">{currency.symbol}</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="w-full bg-transparent text-slate-100 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="Food, Rent, Gas..."
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
                />
              </div>

              {/* Note + button row */}
              <div className="mt-2 flex flex-col gap-3 md:col-span-2 lg:col-span-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-400">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={form.note ?? ""}
                    onChange={(e) => handleChange("note", e.target.value)}
                    placeholder="Short note like &quot;Uber to office&quot;, &quot;Grocery top-up&quot;…"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/70"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 active:translate-y-[1px]"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Voice assistant card */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Voice assistant</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                Beta
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Say things like:{" "}
              <span className="text-slate-200">
                &quot;Add 200 income from delivery&quot; or &quot;Add 50 for food&quot;
              </span>
              .
            </p>
            <div className="mt-3">
              <VoiceAssistant onTextFinal={handleVoiceText} />
              {spokenLog && (
                <p className="mt-2 text-xs text-slate-400">
                  Last command:{" "}
                  <span className="italic text-slate-200">
                    &quot;{spokenLog}&quot;
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==== WageWise AI Coach section ==== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-[0_26px_80px_rgba(56,189,248,0.50)]">
          {/* hero glow / illustration-ish gradients */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-0 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />
            <div className="absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  WageWise AI Coach
                </h2>
                <p className="text-xs text-slate-300">
                  Ask anything about your money. The coach uses your real numbers,
                  not generic tips.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200 ring-1 ring-emerald-400/60">
                Powered by LLM
              </span>
            </div>

            {/* your existing AiInsights UI lives inside */}
            <AiInsights transactions={transactions} currency={currency} />
          </div>
        </section>

        {/* Transactions table */}
        <section className="rounded-3xl border border-slate-800/90 bg-slate-900/95 p-4 text-sm shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
          <h2 className="mb-3 text-base font-semibold">Transactions</h2>
          {loadingTx ? (
            <p className="text-xs text-slate-400">Loading your data…</p>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-slate-400">
              No transactions yet. Add your first one above or use voice.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Note</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, index) => (
                    <tr
                      key={String(t.id ?? index)}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="py-2 pr-3 text-slate-300">{t.date}</td>
                      <td className="py-2 pr-3 capitalize text-slate-300">
                        {t.type}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {t.category}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={
                            t.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }
                        >
                          {currency.symbol}
                          {t.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-400">
                        {t.note ?? "-"}
                      </td>
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="rounded-md border border-slate-600 px-2 py-0.5 text-[11px] text-slate-200 hover:bg-slate-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
