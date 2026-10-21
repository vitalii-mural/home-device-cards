const HOME_DEVICE_CARD_STYLE = ":host{display:block;color-scheme:light;--k-bg:#f4f3ef;--k-card:#fff;--k-text:#26322e;--k-muted:#64716b;--k-line:#e5e8e1;--k-soft:#edf0eb;--k-warm:#a46135;--k-warm-bg:#fbefe3;--k-cool:#386d7b;--k-cool-bg:#e9f2f3;--k-accent:#55765f;--k-accent-bg:#e8f0e7;--k-danger:#a53333}\n:host([dark]){color-scheme:dark;--k-bg:#171a1c;--k-card:#24282b;--k-text:#eef1ed;--k-muted:#abb6af;--k-line:#363d3b;--k-soft:#303735;--k-warm:#efb185;--k-warm-bg:#3b3028;--k-cool:#94cbd3;--k-cool-bg:#26373c;--k-accent:#a5cfaf;--k-accent-bg:#2d3e32;--k-danger:#ffb4ab}\n*{box-sizing:border-box}ha-card{display:block;background:transparent;box-shadow:none;border:0;border-radius:0;color:var(--k-text);font-family:var(--primary-font-family,system-ui,sans-serif)}\n.screen{max-width:440px;width:100%;margin:0 auto;background:var(--k-bg);border-radius:28px;padding:24px 17px 12px;min-height:360px}\nheader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 6px 19px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--k-muted)}h1{font-size:31px;line-height:1.2;letter-spacing:-1px;font-weight:500;margin:4px 0 0}h2{font-size:15px;line-height:1.4;font-weight:500;letter-spacing:-.2px;margin:0}h3{font-size:14px;font-weight:500;margin:0 0 12px}.header-icon{color:var(--k-accent);--mdc-icon-size:23px}\nmain{display:grid;gap:13px}.panel{padding:17px;border-radius:23px;background:var(--k-card)}.panel-top{display:flex;align-items:center;justify-content:space-between;gap:9px}.heading{display:flex;align-items:center;gap:10px;min-width:0}.device-icon{height:39px;width:39px;flex-shrink:0;border-radius:14px;display:grid;place-items:center;--mdc-icon-size:21px}.warm{background:var(--k-warm-bg);color:var(--k-warm)}.cool{background:var(--k-cool-bg);color:var(--k-cool)}.neutral{background:var(--k-soft);color:var(--k-muted)}\n.secondary{display:block;color:var(--k-muted);font-size:11px;line-height:1.5;margin-top:2px}.heating{color:var(--k-warm)}button,select{font:inherit;font-size:12px;color:inherit}button{border:0;cursor:pointer}button:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid var(--k-accent);outline-offset:3px}button:disabled,select:disabled{cursor:default;opacity:.42}button[disabled] ha-icon{opacity:.7}.icon-button,.round{display:grid;place-items:center;width:44px;height:44px;min-width:44px;border-radius:50%;background:var(--k-soft);--mdc-icon-size:19px}.icon-button.active-warm{background:var(--k-warm-bg);color:var(--k-warm)}.icon-button.active-cool{background:var(--k-cool-bg);color:var(--k-cool)}\n.water-large{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:25px 1px 20px}.current{font-size:54px;line-height:1;letter-spacing:-2px;font-weight:400;white-space:nowrap;font-variant-numeric:tabular-nums}.degree{font-size:18px;letter-spacing:0;vertical-align:top;display:inline-block;margin:4px 0 0 3px}.setpoint{text-align:center}.adjust{display:flex;align-items:center;gap:9px;margin-top:8px}.adjust .round{width:40px;height:40px;min-width:40px}.target{font-size:20px;font-variant-numeric:tabular-nums;white-space:nowrap}.progress{height:6px;background:var(--k-soft);border-radius:5px;overflow:hidden}.progress>span{display:block;height:100%;background:var(--k-warm);border-radius:5px}.waiting.progress>span{background:var(--k-muted)}.time{display:flex;align-items:center;gap:6px;color:var(--k-muted);font-size:11px;margin-top:12px;--mdc-icon-size:14px}\n.features,.modes{display:grid;grid-template-columns:1fr 1fr 1.15fr;gap:4px;padding:4px;background:var(--k-soft);border-radius:14px;margin-top:14px}.feature,.mode{min-height:42px;border-radius:10px;font-size:11px;background:transparent;padding:6px 3px;white-space:nowrap}.feature[aria-pressed=true]{background:var(--k-card);color:var(--k-warm)}.mode{display:flex;align-items:center;justify-content:center;gap:4px;--mdc-icon-size:15px}.mode[aria-pressed=true]{background:var(--k-card);color:var(--k-cool)}\n.air-temperature{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:23px 11px;text-align:center}.air-value{font-size:43px;line-height:1;letter-spacing:-1.8px;font-variant-numeric:tabular-nums}.air-degree{font-size:17px;vertical-align:top}.fan{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:12px;font-size:11px;color:var(--k-muted)}.fan-label{display:flex;align-items:center;gap:7px;--mdc-icon-size:16px}.fan select{max-width:145px;min-height:36px;background:transparent;border:0;border-radius:8px;padding:7px 6px;font-size:11px}.fan option{background:var(--k-card);color:var(--k-text)}\n.small-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.metric{position:relative;border-radius:21px;background:var(--k-card);padding:17px;min-width:0}.metric>ha-icon{position:absolute;right:14px;top:17px;color:var(--k-muted);--mdc-icon-size:17px}.metric-value{display:block;margin-top:10px;font-size:27px;font-variant-numeric:tabular-nums;letter-spacing:-.8px}.metric-value small{font-size:13px;letter-spacing:0;color:var(--k-muted)}.metric .secondary{padding-right:15px}.empty-caption{display:block;color:var(--k-muted);font-size:11px;margin-top:4px}\n.status-dot{width:7px;height:7px;border-radius:50%;background:var(--k-muted);margin-right:5px}.status-dot.online{background:var(--k-accent)}.river-values{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:18px}.river-value{font-size:29px;line-height:1.2;font-variant-numeric:tabular-nums}.river-value small{font-size:14px}.power-values{font-size:16px;margin-top:5px;font-variant-numeric:tabular-nums}.text-button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:15px 0 0;color:var(--k-muted);background:transparent;font-size:11px;min-height:38px;--mdc-icon-size:16px}\n.links{display:grid;gap:8px}.link{display:flex;align-items:center;gap:12px;width:100%;padding:14px 17px;border-radius:18px;background:var(--k-card);text-align:left;color:var(--k-text);text-decoration:none;--mdc-icon-size:20px;min-height:67px}.link>ha-icon{flex-shrink:0;color:var(--k-muted)}.link .chevron{margin-left:auto;--mdc-icon-size:17px}.link strong{font-size:12px;font-weight:500}.link small{display:block;font-size:11px;font-weight:400;color:var(--k-muted);margin-top:3px}\nnav{display:flex;justify-content:space-around;gap:5px;border-top:1px solid var(--k-line);margin-top:17px;padding-top:12px}.nav-button{display:flex;flex-direction:column;align-items:center;gap:5px;background:transparent;color:var(--k-muted);border-radius:14px;padding:8px 17px;font-size:11px;min-width:75px;--mdc-icon-size:20px}.nav-button[aria-pressed=true]{background:var(--k-accent-bg);color:var(--k-accent)}\n.data-row{display:flex;justify-content:space-between;align-items:center;gap:15px;border-bottom:1px solid var(--k-line);padding:12px 0;font-size:12px;line-height:1.5}.data-row:last-child{border:0}.data-row>span:last-child{text-align:right;font-variant-numeric:tabular-nums}.subheading{font-size:11px;color:var(--k-muted);margin:6px 0 3px}.notice{font-size:12px;line-height:1.6;color:var(--k-muted);margin:0}.error{padding:12px 15px;border-radius:15px;background:var(--k-card);color:var(--k-danger);font-size:12px;line-height:1.5}.graph-slot{min-height:120px}.graph-slot>*{display:block}.button-row{display:flex;gap:8px;flex-wrap:wrap}.flat-button{background:var(--k-soft);border-radius:12px;min-height:44px;padding:10px 14px;font-size:12px}.wide-button{width:100%;text-align:left}.powered-note{font-size:11px;color:var(--k-muted);line-height:1.5}.screen [hidden]{display:none!important}\n\n@media(pointer:coarse){.feature,.mode,.fan select,.round,.adjust .round{min-height:44px}.adjust .round{min-width:40px;width:40px}}\n.screen[data-layout=desktop]{max-width:none;min-height:calc(100vh - 56px);padding:28px;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto 1fr;gap:22px;border-radius:0}\n.screen[data-layout=desktop] header{padding:0}.screen[data-layout=desktop] .header-icon{display:none}.desktop-caption{font-size:12px;color:var(--k-muted);margin:8px 0 0}\n.screen[data-layout=desktop] nav{grid-column:2;grid-row:1;margin:0;padding:0;border:0;align-self:center}.screen[data-layout=desktop] main{grid-column:1/-1;min-width:0;align-content:start}\n.desktop-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:'water air overview' 'energy energy energy';gap:16px;align-items:start}\n.desktop-water{grid-area:water}.desktop-air{grid-area:air}.desktop-overview{grid-area:overview;display:grid;gap:14px;min-width:0}.desktop-energy{grid-area:energy;min-width:0}.desktop-media{grid-area:media;min-width:0}\n.desktop-water>.panel,.desktop-air>.panel{min-height:300px}.desktop-board .panel{padding:20px}.desktop-board .current{font-size:52px}.desktop-board .water-large{margin-top:30px;margin-bottom:25px}.desktop-board .heading{gap:8px}.desktop-board h2{font-size:14px}.desktop-board .target{font-size:19px}.desktop-board .adjust{gap:6px}.desktop-board .adjust .round{width:34px;min-width:34px;height:38px}.desktop-board .metric{padding:15px}.desktop-board .metric .secondary{padding-right:14px}.desktop-board .metric-value{font-size:26px}\n.energy-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.power-now{font-size:20px;white-space:nowrap;font-variant-numeric:tabular-nums}.power-now small{font-size:11px;color:var(--k-muted)}.energy-stats{display:flex;gap:34px;margin:16px 0 10px}.energy-stats strong{display:block;font-size:24px;font-weight:400;margin-top:4px;font-variant-numeric:tabular-nums}.energy-stats strong small{font-size:11px;color:var(--k-muted)}.desktop-energy .graph-slot{min-height:180px}.desktop-energy .text-button{border-top:1px solid var(--k-line)}.desktop-media>.device-icon{margin-bottom:16px}.desktop-media .link{background:var(--k-soft);margin-top:22px;padding:12px}.desktop-media .notice{margin-top:14px}\n.screen[data-columns=two] .desktop-board{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:'water air' 'overview overview' 'energy energy'}.screen[data-columns=two] .desktop-overview{grid-template-columns:1fr 1fr;align-items:stretch}.screen[data-columns=two] .desktop-overview>.small-grid{align-content:stretch}.screen[data-columns=two] .energy-heading{align-items:start;flex-direction:column}.screen[data-columns=two] .energy-stats{gap:16px;flex-wrap:wrap}.screen[data-columns=two]{padding:20px}";

const HOME_DEVICE_FEEDBACK_STYLE = `
.single-card .socket-card,.single-card .room-sensor-card{width:100%;margin:0;padding:20px;border-radius:24px;background:var(--k-card);color:var(--k-text);font:14px/1.4 system-ui,sans-serif}
.single-card .socket-card *,.single-card .room-sensor-card *{box-sizing:border-box}
.single-card .socket-card svg,.single-card .room-sensor-card svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.single-card .socket-header,.single-card .room-header{display:flex;align-items:center;gap:10px;padding:0}
.single-card .socket-icon,.single-card .room-icon{width:40px;height:40px;display:grid;place-items:center;flex:0 0 40px;border-radius:14px;background:var(--k-soft);color:var(--k-accent)}
.single-card .socket-heading,.single-card .room-heading{flex:1;min-width:0}
.single-card .socket-card h2,.single-card .room-sensor-card h2{font-size:14px;font-weight:500;line-height:1.4;margin:0}
.single-card .socket-card .secondary,.single-card .room-sensor-card .secondary{display:flex;align-items:center;gap:5px;color:var(--k-muted);font-size:12px;line-height:1.4}
.single-card .socket-power-button{width:44px;height:44px;display:grid;place-items:center;flex:0 0 44px;border-radius:50%;background:var(--k-soft);color:var(--k-accent);position:relative}
.single-card .socket-power-button[aria-pressed=false]{background:transparent;color:var(--k-muted);box-shadow:inset 0 0 0 1px var(--k-line)}
.single-card .socket-power-button[data-pending=true] svg{visibility:hidden}
.single-card .socket-spinner{display:none;position:absolute;width:19px;height:19px;border:2px solid var(--k-line);border-top-color:currentColor;border-radius:50%;animation:home-pending-spin .75s linear infinite}
.single-card .socket-power-button[data-pending=true] .socket-spinner{display:block}
.single-card .socket-reading{margin:12px 0 14px}.single-card .socket-reading .metric-value{margin-top:0}
.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value{font-size:36px;line-height:1.2;font-weight:400;letter-spacing:-1.5px;font-variant-numeric:tabular-nums}
.single-card .socket-reading .metric-value small,.single-card .room-reading .metric-value small{font-size:17px;margin-left:5px;letter-spacing:0;color:var(--k-muted)}
.single-card .socket-metrics{display:grid;grid-template-columns:1fr 1fr 1.25fr;background:var(--k-soft);border-radius:14px;padding:10px 0}
.single-card .socket-metrics>div{padding:0 12px;min-width:0}
.single-card .socket-metrics>div+div{border-left:1px solid var(--k-line)}
.single-card .socket-metrics .secondary{white-space:nowrap}
.single-card .socket-metrics strong{display:block;font-size:18px;font-weight:400;margin-top:5px;white-space:nowrap;font-variant-numeric:tabular-nums}
.single-card .socket-metrics strong small{font-size:11px;color:var(--k-muted);margin-left:4px}
.single-card .socket-card .socket-missing{color:var(--k-muted);font-size:17px!important;letter-spacing:0!important;font-weight:400!important}
.single-card .socket-reading .socket-missing{font-size:23px!important;letter-spacing:0!important}
.single-card .socket-metrics strong.socket-missing small{opacity:.6}
.single-card .room-battery{display:flex;align-items:center;gap:5px;color:var(--k-muted);font-size:12px;white-space:nowrap}
.single-card .room-battery svg{width:16px;height:16px}
.single-card .room-readings{display:grid;grid-template-columns:1fr 1fr;margin:16px 0 0}
.single-card .room-reading{min-width:0}
.single-card .room-reading+.room-reading{border-left:1px solid var(--k-line);padding-left:22px}
.single-card .room-reading .secondary{white-space:nowrap}
.single-card .room-reading .metric-value{margin-top:8px}
.single-card .river-card .river-missing{color:var(--k-muted);font-size:17px!important;letter-spacing:0!important;font-weight:400!important}
.single-card .river-card .river-large.river-missing{font-size:23px!important;margin-bottom:10px}
.single-card .river-card .river-percent.river-missing{font-size:17px!important;margin-top:13px;margin-bottom:14px}
.single-card .river-card .river-power strong.river-missing{font-size:15px!important;margin-top:9px}

.single-card .socket-card .socket-missing,.single-card .room-sensor-card .room-missing,.single-card .river-card .river-missing{font-size:16px!important;color:var(--k-muted);font-weight:400!important;letter-spacing:0!important}
.single-card .socket-missing small,.single-card .room-missing small,.single-card .river-missing small{display:none}
.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value{min-height:43px;display:flex;align-items:baseline}
@media(prefers-reduced-motion:reduce){.single-card .socket-spinner{animation:none}}

.single-card [data-live-panel="boiler"] .adjust .round{width:40px;height:40px;min-width:40px;min-height:40px;flex:0 0 40px;padding:0;aspect-ratio:1;border-radius:50%}
.single-card [data-live-panel="air"] .air-more{border-top:1px solid var(--k-line);margin-top:12px;padding-top:7px}
.single-card [data-live-panel="air"] .air-more summary{display:flex;align-items:center;min-height:44px;color:var(--k-muted);font-size:12px;cursor:pointer}
.single-card [data-live-panel="air"] .air-more summary::after{content:'⌄';margin-left:auto;font-size:18px}
.single-card [data-live-panel="air"] .air-more[open] summary::after{transform:rotate(180deg)}
.single-card [data-live-panel="air"] .modes{grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:4px}
.single-card [data-live-panel="air"] .air-temperature{padding:14px 0;min-height:0}
.single-card [data-live-panel="air"] .modes{margin-top:0;margin-bottom:12px}
.single-card [data-live-panel="air"] .mode{width:100%;height:44px;min-height:44px;padding:0;border-radius:12px;background:transparent;--mdc-icon-size:20px}
.single-card [data-live-panel="air"] .mode[aria-pressed="true"]{background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .mode svg{width:23px;height:23px}
.single-card [data-live-panel="air"] .air-fan{border-top:1px solid var(--k-line);padding:10px 0 12px}
.single-card [data-live-panel="air"] .air-fan-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;font-size:12px}
.single-card [data-live-panel="air"] .air-fan-speed{color:var(--k-muted);font-size:12px}
.single-card [data-live-panel="air"] .air-fan-speeds{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:2px}
.single-card [data-live-panel="air"] .air-fan-speeds button{display:grid;place-items:center;min-width:0;min-height:44px;padding:4px 0;border-radius:10px;background:transparent;color:var(--k-muted)}
.single-card [data-live-panel="air"] .air-fan-speeds button[aria-pressed="true"]{background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-fan-speeds svg{width:24px;height:24px;flex-shrink:0}
.single-card [data-live-panel="air"] .air-inline-icon{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-inline-icon text{fill:currentColor;stroke:none;font:10px system-ui,sans-serif}
.single-card [data-live-panel="air"] .air-fan-blades{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-swing-main{display:grid;grid-template-columns:1fr 1fr;gap:15px;border-top:1px solid var(--k-line);margin-top:2px;padding:10px 0 12px}
.single-card [data-live-panel="air"] .air-swing-main-button{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:7px;min-width:0;min-height:44px;padding:2px;background:transparent;color:var(--k-text);font-size:11px}
.single-card [data-live-panel="air"] .air-swing-main-icon{display:grid;place-items:center;width:44px;height:44px;flex:0 0 44px;border:1px solid var(--k-line);border-radius:50%;color:var(--k-muted)}
.single-card [data-live-panel="air"] .air-swing-main-button[aria-pressed="true"] .air-swing-main-icon{border-color:var(--k-cool);background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-swing-main-icon svg{width:28px;height:28px}
.single-card [data-live-panel="air"] .air-fixed-palette{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;padding:4px 0 10px}
.single-card [data-live-panel="air"] .air-fixed-position{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;min-height:64px;padding:7px 2px;background:var(--k-soft);color:var(--k-muted);border-radius:14px;font-size:11px}
.single-card [data-live-panel="air"] .air-fixed-position[aria-pressed="true"]{background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-fixed-position-icon{display:grid;place-items:center;width:36px;height:36px;color:inherit}
.single-card [data-live-panel="air"] .air-fixed-position-icon svg{width:36px;height:36px}
.single-card [data-live-panel="air"] .air-control-label{font-size:11px;color:var(--k-muted);margin:8px 0 5px}
.single-card [data-live-panel="air"] .air-switches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
.single-card [data-live-panel="air"] .air-switch{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;min-height:70px;padding:4px 2px;background:transparent;color:var(--k-muted);font-size:10px;text-align:center;white-space:normal}
.single-card [data-live-panel="air"] .air-control-icon{display:grid;place-items:center;width:48px;height:48px;border:1px solid var(--k-line);border-radius:50%;color:var(--k-muted)}
.single-card [data-live-panel="air"] .air-control-icon svg{width:28px;height:28px}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"]{color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"] .air-control-icon{border-color:var(--k-cool);background:transparent;color:var(--k-cool);border-width:1.6px}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"]{font-weight:500}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"] .air-control-icon svg{stroke-width:1.9}
.single-card [data-live-panel="air"] .air-line-icon{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-icon-text{fill:currentColor;stroke:none;font:700 10px system-ui,sans-serif}
.single-card [data-live-panel="air"] .air-rays path{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.single-card [data-live-panel="air"] .air-rays .ray{stroke-dasharray:1.5 2.5}
.single-card [data-live-panel="air"] .air-rays .ray.selected{stroke-dasharray:none}
.single-card [data-live-panel="air"] .round[data-pending="true"] .air-inline-icon{display:none}
.pending-spinner{box-sizing:border-box;width:16px;height:16px;border:2px solid var(--k-line);border-top-color:currentColor;border-radius:50%;color:var(--k-warm)}
.round .pending-spinner{display:none}

.single-card .device-icon>.air-inline-icon{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-unified{background:var(--k-soft);border-radius:12px;padding:4px;margin-top:12px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px}
.single-card [data-live-panel="air"] .air-unified-first,.single-card [data-live-panel="air"] .air-unified-second,.single-card [data-live-panel="air"] .air-unified .air-fixed-palette{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;height:54px;padding:0;margin:0}
.single-card [data-live-panel="air"] .air-unified button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;width:100%;height:54px;min-height:54px;padding:7px 2px;border:0;border-radius:8px;background:transparent;color:var(--k-muted);font-size:11px;white-space:nowrap}
.single-card [data-live-panel="air"] .air-unified button[aria-pressed="true"]{background:transparent;color:var(--k-cool);font-weight:500}
.single-card [data-live-panel="air"] .air-unified .air-control-icon,.single-card [data-live-panel="air"] .air-unified .air-swing-main-icon,.single-card [data-live-panel="air"] .air-unified .air-fixed-position-icon{width:18px;height:18px;flex:0 0 18px;border:0;background:transparent;color:inherit;border-radius:0}
.single-card [data-live-panel="air"] .air-unified svg{width:18px;height:18px}
.single-card [data-live-panel="air"] .air-fan-speeds{background:var(--k-soft);border-radius:12px;padding:3px}
.single-card [data-live-panel="air"] .air-fan-speeds button[aria-pressed="true"]{background:var(--k-card)}

.single-card [data-live-panel="boiler"] .features{grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:3px}
.single-card [data-live-panel="boiler"] .feature{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0;padding:6px 3px;font-size:11px;white-space:normal}
.single-card [data-live-panel="boiler"] .boiler-feature-icon{display:inline-grid;place-items:center;flex:0 0 16px;width:16px;height:16px;color:inherit}
.single-card [data-live-panel="boiler"] .boiler-feature-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.single-card .secondary{font-size:12px}
.single-card [data-live-panel="boiler"] .feature{font-size:12px}
.single-card [data-live-panel="boiler"] .feature[aria-pressed="true"]{font-weight:600}
.single-card .features:not(:has(>button:not([hidden]))),.single-card .air-unified:not(:has(button:not([hidden]))),.single-card .air-fan:has(.air-fan-speeds[hidden]){display:none}
.single-card .socket-missing small,.single-card .room-missing small,.single-card .river-missing small,.temperature-missing small{display:none}
.single-card .temperature-missing{font-size:16px!important;color:var(--k-muted)!important;letter-spacing:0!important;font-weight:400!important}
.single-card [data-live-panel="air"] .mode[aria-pressed="true"],.single-card [data-live-panel="air"] .air-fan-speeds button[aria-pressed="true"],.single-card [data-live-panel="air"] .air-fixed-position[aria-pressed="true"],.single-card [data-live-panel="air"] .air-unified button[aria-pressed="true"]{background:var(--k-card);color:var(--k-cool);font-weight:600}
.single-card [data-live-panel="air"] .air-swing-main-button[aria-pressed="true"]{background:var(--k-card);color:var(--k-cool);font-weight:600}
.single-card [data-live-panel="air"] .air-swing-main-button[aria-pressed="true"] .air-swing-main-icon{border-color:transparent;background:transparent;color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-unified-first,.single-card [data-live-panel="air"] .air-unified-second{display:contents}
.single-card [data-live-panel="air"] .air-unified-first[hidden],.single-card [data-live-panel="air"] .air-unified-second[hidden]{display:none}.single-card [data-live-panel="air"] .air-unified .air-fixed-palette{grid-column:1/-1}
.single-card [data-live-panel="air"] .air-unified button{font-size:12px;line-height:1.1;white-space:normal;text-align:center;border-radius:10px}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"]{font-weight:600}
.single-card .river-card[data-offline="true"]>:not(.river-header):not(.river-offline-note){display:none!important}
.single-card .river-card .river-offline-note{margin:12px 0 0;color:var(--k-muted);font-size:12px}
.round[data-pending="true"] ha-icon,.round[data-pending="true"] .air-inline-icon{display:none}
.single-card .round>.air-inline-icon,.single-card .icon-button>.air-inline-icon{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
[data-live-panel="air"] .pending-spinner{color:var(--k-cool)}
.round[data-pending="true"] .pending-spinner{display:block;animation:home-pending-spin .75s linear infinite}
/* Shared typography for every standalone device card, including mobile >= 360px. */
:host{--card-value-size:40px;--card-secondary-size:20px;--card-title-size:14px;--card-caption-size:12px}
.single-card{font-family:var(--primary-font-family,system-ui,sans-serif)}
.single-card .socket-card,.single-card .room-sensor-card,.single-card .river-card{font-family:inherit}
.single-card h2,.single-card .desktop-board h2,.single-card .socket-card h2,.single-card .room-sensor-card h2,.single-card .river-heading h2{font-size:var(--card-title-size);font-weight:500;line-height:1.4;letter-spacing:0}
.single-card .desktop-board .current,.single-card .air-value,.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value,.single-card .river-large{font-size:var(--card-value-size);font-weight:400;line-height:1.2;letter-spacing:-1px;font-variant-numeric:tabular-nums}
.single-card .desktop-board .target,.single-card .socket-metrics strong,.single-card .river-power strong,.single-card .river-percent,.single-card .river-runtime strong{font-size:var(--card-secondary-size);font-weight:400;line-height:1.3;letter-spacing:-.3px;font-variant-numeric:tabular-nums}
.single-card .secondary,.single-card .socket-card .secondary,.single-card .room-sensor-card .secondary,.single-card .river-card .secondary,.single-card .river-reading,.single-card .river-detail-row{font-size:var(--card-caption-size);line-height:1.4}
.single-card .degree,.single-card .air-degree,.single-card .metric-value small,.single-card .target small,.single-card .socket-metrics strong small,.single-card .river-large small,.single-card .river-percent small,.single-card .river-power strong small{font-size:var(--card-caption-size);font-weight:400;line-height:1.4;letter-spacing:0;vertical-align:baseline;margin:0 0 0 4px;color:var(--k-muted)}
.single-card .desktop-board .water-large{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 48px;align-items:center;column-gap:12px;row-gap:7px;margin:24px 0 20px}
.single-card .water-large .setpoint{display:contents}
.single-card .water-large .setpoint>.secondary{grid-column:2;grid-row:1;text-align:center;margin:0}
.single-card .water-large>.current{grid-column:1;grid-row:2}
.single-card .desktop-board .water-large .adjust{grid-column:2;grid-row:2;margin:0;align-self:center}
.single-card .water-large>.boiler-current-label{grid-column:1;grid-row:1;margin:0}
.single-card .desktop-board .water-large .adjust{height:48px;gap:8px}
.single-card .water-large .target{min-width:45px;text-align:center}

.single-card .desktop-water>.panel{min-height:0}
@keyframes home-pending-spin{to{transform:rotate(360deg)}}
@media(pointer:coarse){.single-card [data-live-panel="boiler"] .adjust .round{width:44px;height:44px;min-width:44px;min-height:44px;flex-basis:44px}}
@media(prefers-reduced-motion:reduce){.round[data-pending="true"] .pending-spinner{animation:none}}
`;

const HOME_DEVICE_CONTAINER_STYLE = `
:host{container-type:inline-size;container-name:device-card}
@container device-card (max-width:380px){.single-card .panel{padding:14px}.single-card .desktop-water>.panel,.single-card .desktop-air>.panel{min-height:0}.single-card .heading{gap:8px}.single-card .device-icon{width:34px;height:34px}.single-card .current{font-size:47px}.single-card .adjust{gap:6px}.single-card .adjust .round{min-width:36px;width:36px;height:42px}.single-card .target{font-size:19px}.single-card .desktop-board h2{font-size:14px}.single-card .air-temperature{padding:22px 3px;gap:8px}.single-card .metric{padding:14px}.single-card .metric-value{font-size:25px}.single-card .feature,.single-card .mode{font-size:11px}.single-card .desktop-board .water-large{gap:8px}.single-card .data-row{gap:8px}.single-card .socket-card,.single-card .room-sensor-card{padding:16px}.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value{font-size:34px}.single-card .socket-metrics>div{padding:0 8px}.single-card .socket-metrics strong{font-size:17px}.single-card .socket-metrics strong small{font-size:11px}.single-card .room-reading+.room-reading{padding-left:16px}}
@container device-card (min-width:680px){.single-card .desktop-board .panel{padding:20px}.single-card .desktop-air>.panel{min-height:300px}.single-card .desktop-board .current{font-size:52px}.single-card .desktop-board .water-large{margin-top:30px;margin-bottom:25px}.single-card .desktop-board .heading{gap:8px}.single-card .desktop-board h2{font-size:14px}.single-card .desktop-board .target{font-size:19px}.single-card .desktop-board .adjust{gap:6px}.single-card .desktop-board .adjust .round{width:34px;min-width:34px;height:38px}.single-card .desktop-board .metric{padding:15px}.single-card .desktop-board .metric .secondary{padding-right:14px}.single-card .desktop-board .metric-value{font-size:26px}}
@container device-card (max-width:400px){.single-card .desktop-board .water-large{column-gap:8px}.single-card .desktop-board .water-large .adjust{gap:5px}}
`;

const HOME_TV_CARD_STYLE = `
.single-card [data-live-panel="tv"]{--tv-bg:var(--k-card);--tv-soft:var(--k-soft);--tv-active:var(--k-accent-bg);--tv-text:var(--k-text);--tv-muted:var(--k-muted);width:100%;max-width:400px;margin:0 auto;padding:18px;background:var(--tv-bg);color:var(--tv-text);border-radius:24px}
.single-card [data-live-panel="tv"] .tv-header{display:flex;align-items:center;gap:10px;margin:0 0 14px;padding:0}
.single-card [data-live-panel="tv"] .tv-symbol{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:12px;background:var(--tv-soft);color:var(--tv-muted)}
.single-card [data-live-panel="tv"] .tv-symbol svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="tv"] .tv-heading{display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}
.single-card [data-live-panel="tv"] .tv-heading h2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500}
.single-card [data-live-panel="tv"] .tv-status{overflow:hidden;color:var(--tv-muted);font-size:12px;line-height:1.4;text-overflow:ellipsis;white-space:nowrap}
.single-card [data-live-panel="tv"] button{display:grid;place-items:center;position:relative;flex:0 0 44px;width:44px;min-width:44px;height:44px;min-height:44px;padding:0;border:0;border-radius:50%;background:transparent;color:inherit;font:500 13px/1 system-ui,sans-serif;touch-action:manipulation}
.single-card [data-live-panel="tv"] button:hover:not(:disabled){background:var(--tv-active)}
.single-card [data-live-panel="tv"] button:active:not(:disabled){transform:scale(.95)}
.single-card [data-live-panel="tv"] button:focus-visible{outline:2px solid var(--k-accent);outline-offset:2px}
.single-card [data-live-panel="tv"] button:disabled{cursor:default;opacity:.36}
.single-card [data-live-panel="tv"] button[aria-pressed="true"]{background:var(--tv-active)}
.single-card [data-live-panel="tv"] button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="tv"] .tv-power{margin-left:auto}
.single-card [data-live-panel="tv"] .tv-main{display:grid;grid-template-columns:44px 140px 44px;align-items:center;justify-content:space-evenly;gap:8px;margin-bottom:24px}
.single-card [data-live-panel="tv"] .tv-assist{color:var(--tv-muted)}
.single-card [data-live-panel="tv"] .tv-dpad{display:grid;grid-template:repeat(3,44px)/repeat(3,44px);padding:4px;border-radius:50%;background:var(--tv-soft)}
.single-card [data-live-panel="tv"] .tv-up{grid-area:1/2}.single-card [data-live-panel="tv"] .tv-left{grid-area:2/1}.single-card [data-live-panel="tv"] .tv-ok{grid-area:2/2;background:var(--tv-bg);box-shadow:0 1px 4px color-mix(in srgb,var(--tv-text) 8%,transparent)}.single-card [data-live-panel="tv"] .tv-right{grid-area:2/3}.single-card [data-live-panel="tv"] .tv-down{grid-area:3/2}
.single-card [data-live-panel="tv"] .tv-volume{display:flex;flex-direction:column;border-radius:22px;background:var(--tv-soft)}
.single-card [data-live-panel="tv"] .tv-system{display:grid;grid-template-columns:repeat(2,1fr);width:min(100%,232px);margin-inline:auto;padding:2px;border-radius:14px;background:var(--tv-soft)}
.single-card [data-live-panel="tv"] .tv-system button{border-radius:12px}
.single-card [data-live-panel="tv"] .tv-media{display:grid;grid-template-columns:repeat(3,1fr);width:min(100%,232px);margin:6px auto 0}
.single-card [data-live-panel="tv"] .tv-system button,.single-card [data-live-panel="tv"] .tv-media button{display:flex;justify-content:center;gap:2px;width:100%}
.single-card [data-live-panel="tv"] .tv-media button:nth-child(2) svg{width:16px;height:16px}
.single-card [data-live-panel="tv"] .tv-pending{display:none;position:absolute;width:18px;height:18px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:home-pending-spin .75s linear infinite}
.single-card [data-live-panel="tv"] button[data-pending="true"] svg{visibility:hidden}
.single-card [data-live-panel="tv"] button[data-pending="true"] .tv-pending{display:block}
@media(prefers-reduced-motion:reduce){.single-card [data-live-panel="tv"] button[data-pending="true"] .tv-pending{animation:none}}
@container device-card (max-width:380px){.single-card [data-live-panel="tv"]{padding:16px}.single-card [data-live-panel="tv"] .tv-main{grid-template-columns:44px 140px 44px;gap:2px}}
`;

