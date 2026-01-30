import { useState, useEffect } from 'react';
import { SHOP_ITEMS } from '../constants';

export const useTelegram = () => {
  const [credits, setCredits] = useState<number>(0);
  const [isTg, setIsTg] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [userName, setUserName] = useState<string>('我 (Player)');

  const syncCredits = async (change: number, reason: string) => {
    // Optimistic Update
    setCredits(prev => prev + change);
    
    if (window.Telegram?.WebApp?.initData) {
        try {
            await fetch('/api/sync-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    initData: window.Telegram.WebApp.initData,
                    change,
                    reason
                })
            });
        } catch (e) {
            console.error("Sync error", e);
        }
    }
  };

  const handleBuy = async (item: typeof SHOP_ITEMS[0]) => {
    if (!isTg) {
       alert("请在 Telegram App 中打开以使用星星支付 (Stars)。");
       return;
    }
    
    setIsBuying(item.id);

    try {
        const res = await fetch('/api/create-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id })
        });

        if (!res.ok) {
            const err = await res.json() as any;
            throw new Error(err.error || "创建订单失败");
        }

        const data = await res.json() as { invoiceLink: string };
        const invoiceLink = data.invoiceLink;

        if (!invoiceLink) throw new Error("未获取到支付链接");

        window.Telegram?.WebApp.openInvoice(invoiceLink, (status) => {
            if (status === 'paid') {
                fetch('/api/payment-success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ initData: window.Telegram!.WebApp.initData, itemId: item.id })
                })
                .then(r => r.json())
                .then((data: any) => {
                    if (data.credits) setCredits(data.credits);
                });

                setShowShop(false);
                window.Telegram?.WebApp.showPopup({
                    title: '支付成功',
                    message: `成功充值 ${item.credits} 积分!`,
                    buttons: [{type: 'ok'}]
                });
            } else if (status === 'failed') {
                 window.Telegram?.WebApp.showPopup({ title: '支付失败', message: '支付过程遇到问题。' });
            }
            setIsBuying(null);
        });
        
    } catch (e: any) {
        setIsBuying(null);
        window.Telegram?.WebApp.showPopup({ 
            title: '错误', 
            message: e.message || '未知错误' 
        });
    }
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setIsTg(true);

      if (tg.initDataUnsafe?.user?.first_name) {
          setUserName(tg.initDataUnsafe.user.first_name);
      }

      const fetchUser = async () => {
        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData: tg.initData })
            });
            if (res.ok) {
                const data = await res.json() as { credits: number };
                setCredits(data.credits);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingUser(false);
        }
      };

      if (tg.initData) {
        fetchUser();
      } else {
        setIsLoadingUser(false);
        setCredits(200); // Fallback for local testing
      }
    } else {
        setIsLoadingUser(false);
        setCredits(200); // Dev mode
    }
  }, []);

  return {
    isTg,
    credits,
    userName,
    isLoadingUser,
    syncCredits,
    handleBuy,
    isBuying,
    showShop,
    setShowShop
  };
};