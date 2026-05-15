import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRY_CODES, getFlagEmoji } from '@/lib/country-codes';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneInput({
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  placeholder = 'Phone number',
}: PhoneInputProps) {
  return (
    <div
      className={cn(
        'flex items-center rounded-md border border-gray-300 bg-white overflow-hidden min-h-[42px]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 focus-within:border-[#b72b2b]/50'
      )}
    >
      <Select value={countryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger
          className={cn(
            'w-[6rem] min-w-[6rem] shrink-0 border-0 rounded-none bg-gray-50/80 py-2.5 pl-3 pr-2',
            'focus:ring-0 focus:ring-offset-0 cursor-pointer h-auto min-h-[42px]',
            'focus-visible:ring-0 focus-visible:ring-offset-0 gap-1.5'
          )}
        >
          {getFlagEmoji(countryCode) && (
            <span className="text-lg leading-none shrink-0" aria-hidden>
              {getFlagEmoji(countryCode)}
            </span>
          )}
          <SelectValue placeholder="+1" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map(({ code, country }) => (
            <SelectItem key={code} value={code} title={`${code} ${country}`}>
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px bg-gray-300 shrink-0 self-stretch min-h-[24px]" aria-hidden />

      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value)}
        className={cn(
          'border-0 rounded-none flex-1 min-w-0 h-auto min-h-[42px] py-2.5 pt-3 px-3 bg-transparent shadow-none',
          'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0'
        )}
      />
    </div>
  );
}
