import { Observable } from 'rxjs/Observable';
export interface CollectionViewer {
    viewChange: Observable<{
        start: number;
        end: number;
    }>;
}
export declare abstract class DataSource<T> {
    abstract connect(collectionViewer: CollectionViewer): Observable<T[]>;
}
