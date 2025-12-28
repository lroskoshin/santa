"use client";

interface ParticipantFormFieldsProps {
  allowWishlist: boolean;
  requireEmail: boolean;
  dictionary: {
    yourName?: string;
    name?: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    emailHint?: string;
    wishlist: string;
    wishlistPlaceholder: string;
    wishlistHint?: string;
    wishlistWantGift?: string;
    wishlistWantGiftLink?: string;
    optional: string;
  };
  fieldErrors?: {
    name?: string[];
    email?: string[];
    wishlist?: string[];
  };
}

export function ParticipantFormFields({
  allowWishlist,
  requireEmail,
  dictionary,
  fieldErrors,
}: ParticipantFormFieldsProps) {
  const nameLabel = dictionary.yourName || dictionary.name;
  const nameError = fieldErrors?.name?.[0];
  const emailError = fieldErrors?.email?.[0];
  const wishlistError = fieldErrors?.wishlist?.[0];

  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">
          {nameLabel}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder={dictionary.namePlaceholder}
          required
          maxLength={50}
          className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {nameError && <p className="text-sm text-red-400">{nameError}</p>}
      </div>

      {requireEmail && (
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            {dictionary.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={dictionary.emailPlaceholder}
            required
            maxLength={100}
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {emailError && <p className="text-sm text-red-400">{emailError}</p>}
          {dictionary.emailHint && (
            <p className="text-xs text-slate-500">{dictionary.emailHint}</p>
          )}
        </div>
      )}

      {allowWishlist && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="wishlist"
            className="text-sm font-medium text-slate-300"
          >
            {dictionary.wishlist}
            <span className="ml-2 text-slate-500">{dictionary.optional}</span>
          </label>
          <textarea
            id="wishlist"
            name="wishlist"
            placeholder={dictionary.wishlistPlaceholder}
            maxLength={500}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {wishlistError && (
            <p className="text-sm text-red-400">{wishlistError}</p>
          )}
          {dictionary.wishlistHint && (
            <p className="text-xs text-slate-500">{dictionary.wishlistHint}</p>
          )}
          {dictionary.wishlistWantGift && (
            <p className="text-xs text-slate-500">
              {dictionary.wishlistWantGift}{" "}
              <a
                href="https://wantgift.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
              >
                WantGift
              </a>
              {dictionary.wishlistWantGiftLink}
            </p>
          )}
        </div>
      )}
    </>
  );
}







