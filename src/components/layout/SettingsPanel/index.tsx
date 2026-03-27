import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { SettingsPanelProps } from '../../../types/props';
import type { UserPreferences } from '../../../types';
import './settings-panel.scss';

interface NumericFieldProps {
    value: number;
    min: number;
    step?: number;
    onChange: (value: number) => void;
}

function NumericField({ value, min, step = 1, onChange }: NumericFieldProps) {
    const clamp = (next: number) => (Number.isFinite(next) ? Math.max(min, next) : min);

    return (
        <div className="settings-panel__spinner">
            <input
                type="number"
                min={min}
                step={step}
                value={value}
                onChange={(e) => onChange(clamp(Number(e.target.value)))}
            />
            <div className="settings-panel__spinner-controls">
                <button
                    type="button"
                    className="settings-panel__spinner-btn settings-panel__spinner-btn--up"
                    onClick={() => onChange(clamp(Number((value + step).toFixed(4))))}
                    aria-label="Increase value"
                >
                    <ChevronUp />
                </button>
                <button
                    type="button"
                    className="settings-panel__spinner-btn settings-panel__spinner-btn--down"
                    onClick={() => onChange(clamp(Number((value - step).toFixed(4))))}
                    aria-label="Decrease value"
                >
                    <ChevronDown />
                </button>
            </div>
        </div>
    );
}

export function SettingsPanel({
    isOpen,
    preferences,
    defaultPreferences,
    onClose,
    onSave,
}: SettingsPanelProps) {
    const [draft, setDraft] = useState<UserPreferences>(preferences);

    useEffect(() => {
        if (isOpen) setDraft(preferences);
    }, [isOpen, preferences]);

    if (!isOpen) return null;

    const update = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) =>
        setDraft((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="settings-panel__backdrop" onClick={onClose}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settings-panel__header">
                    <h3>Settings</h3>
                    <button className="settings-panel__close" onClick={onClose} aria-label="Close settings">
                        <X />
                    </button>
                </div>

                <div className="settings-panel__section">
                    <div className="settings-panel__inline-field">
                        <label>Theme</label>
                        <select
                            value={draft.theme}
                            onChange={(e) => update('theme', e.target.value as UserPreferences['theme'])}
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                </div>

                <div className="settings-panel__section">
                    <div className="settings-panel__inline-field">
                        <label>Default timeframe</label>
                        <select
                            value={draft.defaultTimeframe}
                            onChange={(e) => update('defaultTimeframe', e.target.value)}
                        >
                            <option value="1m">1m</option>
                            <option value="5m">5m</option>
                            <option value="15m">15m</option>
                            <option value="1h">1h</option>
                            <option value="4h">4h</option>
                            <option value="1D">1D</option>
                            <option value="1W">1W</option>
                        </select>
                    </div>
                </div>

                <div className="settings-panel__section">
                    <h4>Indicator Periods</h4>
                    <div className="settings-panel__grid">
                        <label>SMA</label>
                        <NumericField
                            value={draft.indicatorPeriods.sma}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: { ...prev.indicatorPeriods, sma: next },
                                }))
                            }
                        />

                        <label>EMA</label>
                        <NumericField
                            value={draft.indicatorPeriods.ema}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: { ...prev.indicatorPeriods, ema: next },
                                }))
                            }
                        />

                        <label>RSI</label>
                        <NumericField
                            value={draft.indicatorPeriods.rsi}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: { ...prev.indicatorPeriods, rsi: next },
                                }))
                            }
                        />

                        <label>Bollinger Period</label>
                        <NumericField
                            value={draft.indicatorPeriods.bollingerPeriod}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: {
                                        ...prev.indicatorPeriods,
                                        bollingerPeriod: next,
                                    },
                                }))
                            }
                        />

                        <label>Bollinger StdDev</label>
                        <NumericField
                            value={draft.indicatorPeriods.bollingerStdDev}
                            min={0.1}
                            step={0.1}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: {
                                        ...prev.indicatorPeriods,
                                        bollingerStdDev: next,
                                    },
                                }))
                            }
                        />

                        <label>MACD Fast</label>
                        <NumericField
                            value={draft.indicatorPeriods.macdFast}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: { ...prev.indicatorPeriods, macdFast: next },
                                }))
                            }
                        />

                        <label>MACD Slow</label>
                        <NumericField
                            value={draft.indicatorPeriods.macdSlow}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: { ...prev.indicatorPeriods, macdSlow: next },
                                }))
                            }
                        />

                        <label>MACD Signal</label>
                        <NumericField
                            value={draft.indicatorPeriods.macdSignal}
                            min={2}
                            onChange={(next) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    indicatorPeriods: {
                                        ...prev.indicatorPeriods,
                                        macdSignal: next,
                                    },
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="settings-panel__section">
                    <h4>Chart Colors</h4>
                    <div className="settings-panel__grid">
                        <label>Bullish</label>
                        <input
                            type="color"
                            value={draft.chartColors.bullish}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    chartColors: { ...prev.chartColors, bullish: e.target.value },
                                }))
                            }
                        />

                        <label>Bearish</label>
                        <input
                            type="color"
                            value={draft.chartColors.bearish}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    chartColors: { ...prev.chartColors, bearish: e.target.value },
                                }))
                            }
                        />

                        <label>Line</label>
                        <input
                            type="color"
                            value={draft.chartColors.line}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    chartColors: { ...prev.chartColors, line: e.target.value },
                                }))
                            }
                        />

                        <label>Grid</label>
                        <input
                            type="color"
                            value={draft.chartColors.grid}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    chartColors: { ...prev.chartColors, grid: e.target.value },
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="settings-panel__actions">
                    <button
                        className="settings-panel__btn settings-panel__btn--ghost"
                        onClick={() => setDraft(defaultPreferences)}
                    >
                        Reset
                    </button>
                    <button className="settings-panel__btn settings-panel__btn--ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="settings-panel__btn settings-panel__btn--primary"
                        onClick={() => {
                            onSave(draft);
                            onClose();
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
