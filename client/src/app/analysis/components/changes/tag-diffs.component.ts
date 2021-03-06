import {ChangeDetectionStrategy} from "@angular/core";
import {Component, Input} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {PageWidthService} from "../../../components/shared/page-width.service";
import {TagDiffs} from "../../../kpn/api/common/diff/tag-diffs";

@Component({
  selector: "kpn-tag-diffs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="!!tagDiffs">
      <div *ngIf="small$ | async; then small else large"></div>
      <ng-template #small>
        <kpn-tag-diffs-text *ngIf="small$ | async; else large" [tagDiffs]="tagDiffs"></kpn-tag-diffs-text>
      </ng-template>
      <ng-template #large>
        <kpn-tag-diffs-table #large [tagDiffs]="tagDiffs"></kpn-tag-diffs-table>
      </ng-template>
    </div>
  `
})
export class TagDiffsComponent {

  @Input() tagDiffs: TagDiffs;

  small$: Observable<boolean>;

  constructor(private pageWidthService: PageWidthService) {
    this.small$ = pageWidthService.current$.pipe(map(() => this.small()));
  }

  private small(): boolean {
    return this.pageWidthService.isSmall() || this.pageWidthService.isVerySmall() || this.pageWidthService.isVeryVerySmall();
  }

}
