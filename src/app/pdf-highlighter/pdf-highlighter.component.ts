import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { assetUrl } from '../api.config';

pdfjsLib.GlobalWorkerOptions.workerSrc = assetUrl('assets/pdfjs/pdf.worker.min.js');

@Component({
  selector: 'app-pdf-highlighter',
  templateUrl: './pdf-highlighter.component.html',
  styleUrls: ['./pdf-highlighter.component.css']
})
export class PdfHighlighterComponent implements OnChanges {
  @Input() text: any;
  @Input() nodeName: any;
  @Input() pdfSource: string = assetUrl('assets/History_of_artificial_intelligence.pdf');
  showPdf = false;
  // text: string = `in 1955, allen newell and future nobel laureate herbert a.`;
  text1: any = `In Greek mythology, Talos was a giant made of bronze who acted as guardian for the island of Crete.`
  pdfUrl: any = ""
  highlightUrl!: SafeResourceUrl;
  
  // Text to search for
  searchText = `in 1955, allen newell and future nobel laureate herbert a. simon created the 'logic theorist', with help from j. c. shaw. the program would eventually prove 38 of the first 52 theorems in russell and whitehead's principia mathematica, and find new and more elegant proofs for some.[78] simon said that they had 'solved the venerable mind/body problem, explaining how a system composed of matter can have the properties of mind.'[79][c] the symbolic reasoning paradigm they introduced would dominate ai research and funding until the middle 90s, as well as inspire the cognitive revolution.`;
  
  // Variable to store the matching PDF text
  matchingText: string[] = [];
  /** Pending timeout for debounced openPdf; cleared when text changes again so highlight updates on every path click */
  private openPdfTimeout: any = null;

  constructor(public sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {

  }

  public getNodeName(): string {
   const data: any = {
    "AI Powers Real Systems": "AI Behind the Scenes",
   }
   return data[this.nodeName] || this.nodeName;
  }

  openPdf(text: string) {
    const pdfPath = assetUrl(this.pdfSource || 'assets/History_of_artificial_intelligence.pdf');
    const viewerHtml = assetUrl('assets/pdfjs/web/viewer.html');

    // Preserve structure and spacing (newlines, citations like [242]) as in source. Normalize line endings and trim.
    let cleaned = (text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    // Truncate at first double or single quote only if we need to limit length; keep structure up to that point
    const quoteIndex = Math.min(
      ...['"', "'"].map((q) => cleaned.indexOf(q)).filter((i) => i >= 0)
    );
    if (quoteIndex >= 0) {
      cleaned = cleaned.slice(0, quoteIndex).trim();
    }

    // Encode for URL; preserve brackets so citations [242] etc. can match.
    let encoded = encodeURIComponent(cleaned)
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']');

    const encodedPdfPath = encodeURIComponent(pdfPath);
    const cacheBust = Date.now();
    const newUrl = `${viewerHtml}?file=${encodedPdfPath}&_t=${cacheBust}#search=${encoded}&phrase=true&caseSensitive=false&highlightAll=true`;

    this.pdfUrl = '';
    this.showPdf = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.pdfUrl = newUrl;
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] || changes['pdfSource']) {
      if (this.openPdfTimeout) {
        clearTimeout(this.openPdfTimeout);
        this.openPdfTimeout = null;
      }
      const textToUse = this.text;
      this.openPdfTimeout = setTimeout(() => {
        this.openPdfTimeout = null;
        if (textToUse != null && String(textToUse).trim() !== '') {
          // Pass content as-is (structure and spacing preserved; only outer trim)
          this.openPdf(String(textToUse).trim());
        } else if (this.pdfUrl) {
          this.pdfUrl = '';
          this.cdr.detectChanges();
        }
      }, 100);
    }
  }


  closePdf() {
    this.showPdf = false;
  }
}