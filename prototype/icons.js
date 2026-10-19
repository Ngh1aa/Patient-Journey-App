(function () {
  function icon(name, size = 20, cls = '') {
    const s = size;
    const common = `width="${s}" height="${s}" class="cf-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
    const solid = common.replace('fill="none"', 'fill="currentColor"').replace('stroke="currentColor"', 'stroke="none"');
    switch (name) {
      case 'home-filled':
        return `<svg ${solid}><path fill-rule="evenodd" d="M12 2 2 10v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10Zm-2 12h4v8h-4Z"/></svg>`;
      case 'calendar-filled':
        return `<svg ${solid}><path fill-rule="evenodd" d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4h14v2H5Zm2 5h3v3H7Zm7 0h3v3h-3ZM7 18h3v2H7Z"/><path d="M7 1h2v5H7Zm8 0h2v5h-2Z"/></svg>`;
      case 'user-filled':
        return `<svg ${solid}><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></svg>`;
      case 'headphones-filled':
        return `<svg ${solid}><path d="M2 12a10 10 0 0 1 20 0v6a3 3 0 0 1-3 3h-2v-9h3a8 8 0 0 0-16 0h3v9H5a3 3 0 0 1-3-3Z"/></svg>`;
      case 'search':
        return `<svg ${common}><circle cx="10.5" cy="10.5" r="7.5"></circle><path d="m16 16 5 5"></path></svg>`;
      case 'upload':
        return `<svg ${common}><path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"></path></svg>`;
      case 'flask':
        return `<svg ${common}><path d="M9 3h6m-5 0v6L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M7 15h10"></path></svg>`;
      case 'stethoscope':
        return `<svg ${common}><path d="M5 3v5a5 5 0 0 0 10 0V3M3 3h4m6 0h4M10 13v3a5 5 0 0 0 10 0v-2"></path><circle cx="20" cy="11" r="3"></circle></svg>`;
      case 'users':
        return `<svg ${common}><circle cx="9" cy="7" r="3"></circle><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"></path></svg>`;
      case 'plus':
        return `<svg ${common}><path d="M12 5v14M5 12h14"></path></svg>`;
      case 'settings':
        return `<svg ${common}><path d="M4 7h16M4 17h16"></path><circle cx="8" cy="7" r="3" fill="var(--surface,white)"></circle><circle cx="16" cy="17" r="3" fill="var(--surface,white)"></circle></svg>`;
      case 'house':
      case 'home':
        return `<svg ${common}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
      case 'calendar-plus':
        return `<svg ${common}><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M8 2v4M16 2v4M3 10h18M12 13v7M8.5 16.5h7"></path></svg>`;
      case 'headphones':
        return `<svg ${common}><path d="M3 14v-3a9 9 0 0 1 18 0v3M5 14h2v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM17 14h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2Z"></path></svg>`;
      case 'message-circle':
        return `<svg ${common}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.8L3 21l1.9-5a9 9 0 1 1 16.1-4.5Z"></path></svg>`;
      case 'log-out':
        return `<svg ${common}><path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"></path></svg>`;
      case 'calendar':
        return `<svg ${common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
      case 'person':
      case 'user':
        return `<svg ${common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      case 'phone':
        return `<svg ${common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
      case 'bell':
        return `<svg ${common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
      case 'arrow-right':
        return `<svg ${common}><path d="M4 12h16"></path><polyline points="13 5 20 12 13 19"></polyline></svg>`;
      case 'chevron-right':
        return `<svg ${common}><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      case 'chevron-down':
        return `<svg ${common}><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      case 'globe':
        return `<svg ${common}><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18"></path></svg>`;
      case 'chevron-left':
        return `<svg ${common}><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      case 'check':
        return `<svg ${common}><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case 'check-circle':
        return `<svg ${common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      case 'clock':
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      case 'location':
      case 'map-pin':
        return `<svg ${common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      case 'video':
        return `<svg ${common}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
      case 'camera':
        return `<svg ${common}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
      case 'microphone':
      case 'mic':
        return `<svg ${common}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      case 'warning':
      case 'alert-triangle':
        return `<svg ${common}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case 'info':
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      case 'cross':
      case 'x-circle':
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      case 'arrow-clockwise':
      case 'refresh':
        return `<svg ${common}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
      case 'document':
      case 'file-text':
        return `<svg ${common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
      case 'document-check':
        return `<svg ${common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg>`;
      case 'pill':
        return `<svg ${common}><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line></svg>`;
      case 'shield':
        return `<svg ${common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      case 'copy':
        return `<svg ${common}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      case 'lock':
        return `<svg ${common}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      case 'heart-pulse':
        return `<svg ${common}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      case 'loader':
        return `<svg ${common}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
      default:
        return `<svg ${common}><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
  }

  // Neutral profile symbol: no stock portrait is assigned to a named person.
  window.CareFlowAvatar = function (seed, size = 44) {
    return `<span class="cf-person-avatar" style="width:${Number(size)}px;height:${Number(size)}px" aria-hidden="true">${icon('user',Math.round(Number(size)*.55))}</span>`;
  };
  window.CareFlowIcon = icon;
})();
