export interface Task {
    id: string;
    status: string;
    actions: TaskAction[];
    created_at: number;
    updated_at: number;
    scope: string;
    is_web_real: boolean;
    web_project_id: string;
    url: string;
    prompt: string;
    screenshot: string;
    screenshot_description: string;
    specifications: {
        viewport_width: number;
        viewport_height: number;
        screen_width: number;
        screen_height: number;
        device_pixel_ratio: number;
        scroll_x: number;
        scroll_y: number;
        browser_x: number;
        browser_y: number;
    };
    relevant_data: Record<string, any>;
    should_record: boolean;
    original_prompt: string;
    id_: string;
}

export interface TaskAction {
    action: string;
    data: any;
}

export interface UpdateTaskRequest {
    status: string;
    actions: TaskAction[];
}

export type MousePosition = {
    x: number;
    y: number;
    scrollY: number;
};